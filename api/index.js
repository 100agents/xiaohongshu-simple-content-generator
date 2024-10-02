const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/analyze', async (req, res) => {
  try {
    const { content, type } = req.body;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专业的小红书文案分析师和写手。"},
        {role: "user", content: `分析这篇${type}类型的小红书文章，给出写作特点和爆款原因：\n\n${content}`}
      ],
    });
    const analysis = completion.data.choices[0].message.content;
    const promptCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专业的小红书文案写手。"},
        {role: "user", content: `根据以下分析，给出一个能够生成类似爆款文案的提示词：\n\n${analysis}`}
      ],
    });
    const prompt = promptCompletion.data.choices[0].message.content;
    res.json({ analysis, prompt });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: '分析过程中出错' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, originalArticle } = req.body;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "你是一个专业的小红书文案写手。"},
        {role: "user", content: `使用以下提示词优化这篇文章：\n\n提示词：${prompt}\n\n原文：${originalArticle}`}
      ],
    });
    const generatedArticle = completion.data.choices[0].message.content;
    res.json({ generatedArticle });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: '生成过程中出错' });
  }
});

module.exports = app;