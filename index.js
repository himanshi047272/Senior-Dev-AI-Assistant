/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useRef } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import hljs from "https://esm.sh/highlight.js@11.9.0";

function CodeAssistantApp() {
  const [inputCode, setInputCode] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const resultRef = useRef(null);

  const LANGUAGES = [
    "typescript", "javascript", "python", "java", 
    "cpp", "rust", "go", "ruby", "swift"
  ];

  const copyToClipboard = () => {
    if (resultRef.current) {
      navigator.clipboard.writeText(analysisResult).then(() => {
        alert("✅ Analysis copied to clipboard!");
      }).catch(err => console.error("Copy failed", err));
    }
  };

  const performCodeAnalysis = async (analysisType) => {
    setLoading(true);
    try {
      const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: inputCode, 
          type: analysisType,
          language: language
        })
      });
      
      if (!response.ok) throw new Error("Server error");
      const result = await response.text();
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult(`🚨 Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const highlightedResult = analysisResult 
    ? hljs.highlightAuto(analysisResult).value 
    : "";

  return (
    <div className="container">
      <h1>🤖 Senior Dev AI Assistant</h1>
      <div className="code-controls">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <div className="code-input">
          <textarea
            placeholder={`Paste your ${language} code here...`}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            rows={10}
          />
        </div>
      </div>
      <div className="actions">
        <button onClick={() => performCodeAnalysis("review")}>🔍 AI Code Review</button>
        <button onClick={() => performCodeAnalysis("explain")}>📖 Explain Code</button>
        <button onClick={() => performCodeAnalysis("optimize")}>⚡ Performance Optimize</button>
        <button onClick={() => performCodeAnalysis("refactor")}>🧹 Auto Refactor</button>
      </div>
      {loading && <div className="loading">Analyzing Code... 🤔</div>}
      {analysisResult && (
        <div className="analysis-result">
          <div className="result-header">
            <h3>Analysis Result:</h3>
            <button 
              onClick={copyToClipboard} 
              className="copy-button"
            >📋 Copy</button>
          </div>
          <pre 
            ref={resultRef} 
            style={{
              backgroundColor: '#f4f4f4',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto',
              fontFamily: 'Courier New, monospace'
            }}
            dangerouslySetInnerHTML={{ __html: highlightedResult }} 
          />
        </div>
      )}
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<CodeAssistantApp />);
}
if (typeof document !== "undefined") { client(); }

