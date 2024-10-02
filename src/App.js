import { AlertCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: articleContent,
          type: articleType
        }),
      });
      if (!response.ok) {
        throw new Error('网络响应不正确');
      }
      const data = await response.json();
      setAnalysisResult(data.analysis);
      setPrompt(data.prompt);
    } catch (err) {
      setError('分析过程中出错：' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          originalArticle
        }),
      });
      if (!response.ok) {
        throw new Error('网络响应不正确');
      }
      const data = await response.json();
      setGeneratedArticle(data.generatedArticle);
    } catch (err) {
      setError('生成过程中出错：' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">小红书爆款文章智能编辑器</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <AlertCircle className="inline-block mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 文章分析区 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">文章分析</h2>
          <textarea
            className="w-full h-40 p-2 border rounded mb-2"
            placeholder="请输入小红书爆款文章内容"
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded mb-2"
            value={articleType}
            onChange={(e) => setArticleType(e.target.value)}
          >
            <option value="">选择文章类型</option>
            <option value="food">美食</option>
            <option value="travel">旅游</option>
            <option value="fashion">时尚</option>
            <option value="tech">科技</option>
          </select>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-bold">分析结果</h3>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>

        {/* 文案生成区 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">文案生成</h2>
          <textarea
            className="w-full h-20 p-2 border rounded mb-2"
            placeholder="提示词"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <textarea
            className="w-full h-40 p-2 border rounded mb-2"
            placeholder="请输入需要优化的文章"
            value={originalArticle}
            onChange={(e) => setOriginalArticle(e.target.value)}
          />
          <button
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
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
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <h3 className="font-bold">生成的优化文案</h3>
              <p>{generatedArticle}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;