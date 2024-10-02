import { AlertCircle, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const [articleContent, setArticleContent] = useState('');
  const [articleType, setArticleType] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [originalArticle, setOriginalArticle] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSSE = async (url, body, setStateFunction, setLoadingFunction, additionalAction = null) => {
    setStateFunction('');
    setLoadingFunction(true);
    setError('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const decodedChunk = decoder.decode(value, { stream: true });
        const lines = decodedChunk.split('\n');
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              setError(data.error);
              setLoadingFunction(false);
            } else if (data.done) {
              setLoadingFunction(false);
              if (additionalAction) additionalAction(fullContent);
            } else {
              fullContent += data.content || '';
              setStateFunction(fullContent);
            }
          }
        });
      }
    } catch (err) {
      setError('连接错误: ' + err.message);
      setLoadingFunction(false);
    }
  };

  const handleAnalyze = () => {
    handleSSE(
      '/api/analyze',
      { content: articleContent, type: articleType },
      setAnalysisResult,
      setIsAnalyzing,
      (fullContent) => {
        // 生成提示词并自动填充到提示词输入框
        const generatedPrompt = `基于以下分析结果创作一篇吸引人的${articleType}类型的小红书文章：\n\n${fullContent}`;
        setPrompt(generatedPrompt);
      }
    );
  };

  const handleGenerate = () => {
    handleSSE('/api/generate', { prompt, originalArticle }, setGeneratedArticle, setIsGenerating);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">小红书爆款文章智能编辑器</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-bold">错误</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* 文章分析区 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">文章分析</h2>
              <textarea
                className="w-full h-40 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="请输入小红书爆款文章内容"
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
              />
              <select
                className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={articleType}
                onChange={(e) => setArticleType(e.target.value)}
              >
                <option value="">选择文章类型</option>
                <option value="美食">美食</option>
                <option value="旅游">旅游</option>
                <option value="时尚">时尚</option>
                <option value="科技">科技</option>
              </select>
              <button
                className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition duration-200"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="inline-block mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '分析'
                )}
              </button>
              {analysisResult && (
                <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                  <h3 className="font-bold mb-2">分析结果</h3>
                  <p>{analysisResult}</p>
                </div>
              )}
            </div>

            {/* 文案生成区 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">文案生成</h2>
              <textarea
                className="w-full h-20 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="提示词"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <textarea
                className="w-full h-40 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="请输入需要优化的文章"
                value={originalArticle}
                onChange={(e) => setOriginalArticle(e.target.value)}
              />
              <button
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="inline-block mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成'
                )}
              </button>
              {generatedArticle && (
                <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                  <h3 className="font-bold mb-2">生成的优化文案</h3>
                  <p>{generatedArticle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;