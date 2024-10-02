import React, { useState } from 'react';
import { AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
        throw new Error('网络响应不正�?);
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
        throw new Error('网络响应不正�?);
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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 文章分析�?*/}
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
          <Button
            className="w-full"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析�?..
              </>
            ) : (
              '分析'
            )}
          </Button>
          {analysisResult && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>分析结果</AlertTitle>
              <AlertDescription>{analysisResult}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 文案生成�?*/}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">文案生成</h2>
          <textarea
            className="w-full h-20 p-2 border rounded mb-2"
            placeholder="提示�?
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <textarea
            className="w-full h-40 p-2 border rounded mb-2"
            placeholder="请输入需要优化的文章"
            value={originalArticle}
            onChange={(e) => setOriginalArticle(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成�?..
              </>
            ) : (
              '生成'
            )}
          </Button>
          {generatedArticle && (
            <Alert className="mt-4">
              <Zap className="h-4 w-4" />
              <AlertTitle>生成的优化文�?/AlertTitle>
              <AlertDescription>{generatedArticle}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
