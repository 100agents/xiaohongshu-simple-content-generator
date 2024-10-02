const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handleStream = async (res, messages) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",  // 使用 GPT-4o Mini 模型
      messages: messages,
      max_tokens: 4096,  // 限制最大输出令牌数为 4096
      stream: true,
    }, { responseType: 'stream' });

    completion.data.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          return;
        }
        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices[0].delta.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    });

    completion.data.on('end', () => {
      res.end();
    });

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

app.post('/api/analyze', async (req, res) => {
  const { content, type } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const messages = [
    {role: "system", content: "你是一个专业的小红书文案分析师和写手。请分析给定的文章，并提供详细的写作特点和爆款原因分析。然后，基于这个分析，生成一个创作类似爆款文章的提示词。"},
    {role: "user", content: `分析这篇${type}类型的小红书文章，给出写作特点和爆款原因：\n\n${content}`}
  ];

  await handleStream(res, messages);
});

app.post('/api/generate', async (req, res) => {
  const { prompt, originalArticle } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const messages = [
    {role: "system", content: "你是一个专业的小红书文案写手。请根据给定的提示词和原文，创作一篇优化后的小红书爆款文章。"},
    {role: "user", content: `使用以下提示词优化这篇文章：\n\n提示词：${prompt}\n\n原文：${originalArticle}`}
  ];

  await handleStream(res, messages);
});

module.exports = app;