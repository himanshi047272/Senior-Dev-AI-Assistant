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
      navigator.clipboard.writeText(analysisResult);
      alert("✅ Analysis copied to clipboard!");
    }
  };

  const performCodeAnalysis = async (analysisType) => {
    setLoading(true);
    try {
      const response = await fetch("/analyze", {
        method: "POST",
        body: JSON.stringify({ 
          code: inputCode, 
          type: analysisType,
          language: language
        })
      });
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
        <button onClick={() => performCodeAnalysis("review")}>
          🔍 AI Code Review
        </button>
        <button onClick={() => performCodeAnalysis("explain")}>
          📖 Explain Code
        </button>
        <button onClick={() => performCodeAnalysis("optimize")}>
          ⚡ Performance Optimize
        </button>
        <button onClick={() => performCodeAnalysis("refactor")}>
          🧹 Auto Refactor
        </button>
      </div>
      {loading && <div className="loading">Analyzing Code... 🤔</div>}
      {analysisResult && (
        <div className="analysis-result">
          <div className="result-header">
            <h3>Analysis Result:</h3>
            <button 
              onClick={copyToClipboard} 
              className="copy-button"
            >
              📋 Copy
            </button>
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
            dangerouslySetInnerHTML={{__html: highlightedResult}} 
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

export default async function server(request: Request): Promise<Response> {
  if (request.method === "POST") {
    const { OpenAI } = await import("https://esm.town/v/std/openai");
    const openai = new OpenAI();
    
    const { code, type, language } = await request.json();
    
    const prompts = {
      review: `Perform a comprehensive code review for this ${language} code. 
        Identify potential bugs, security vulnerabilities, and code quality issues. 
        Provide specific, actionable recommendations:\n${code}`,
      
      explain: `Break down this ${language} code in a beginner-friendly manner. 
        Explain the logic, purpose of each section, and provide insights into 
        how the code works internally:\n${code}`,
      
      optimize: `Analyze this ${language} code for performance bottlenecks. 
        Suggest specific optimizations, more efficient algorithms, 
        and best practices to improve computational efficiency:\n${code}`,
      
      refactor: `Refactor this ${language} code to follow industry best practices. 
        Focus on improving code readability, maintainability, and adhering to 
        clean code principles. Provide a fully refactored version:\n${code}`
    };

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompts[type] }],
      model: "gpt-4o-mini",
      max_tokens: 500
    });

    return new Response(completion.choices[0].message.content, {
      headers: { "Content-Type": "text/plain" }
    });
  }

  return new Response(`
    <html>
      <head>
        <title>Senior Dev AI Assistant</title>
        <style>${css}</style>
        <style>
          /* Syntax Highlighting Styles */
          pre code.hljs { 
            display: block; 
            overflow-x: auto; 
            padding: 1em; 
            background: #f4f4f4; 
          }
          pre code.hljs::-webkit-scrollbar { 
            width: 10px; 
          }
          pre code.hljs::-webkit-scrollbar-track { 
            background: #f1f1f1; 
          }
          pre code.hljs::-webkit-scrollbar-thumb { 
            background: #888; 
            border-radius: 5px; 
          }
          code.hljs .hljs-keyword { color: #007020; font-weight: bold; }
          code.hljs .hljs-string { color: #4070a0; }
          code.hljs .hljs-comment { color: #60a0b0; font-style: italic; }
          code.hljs .hljs-function { color: #06287e; }
          code.hljs .hljs-number { color: #40a070; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}

const css = `
body {
  font-family: 'Inter', 'Arial', sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f7f6;
  color: #333;
}
.container {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}
.code-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.language-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: 'Courier New', monospace;
  background-color: #f9f9f9;
}
.actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}
button {
  flex: 1;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}
button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}
.copy-button {
  background-color: #2ecc71;
  padding: 6px 12px;
  font-size: 0.9em;
}
.analysis-result {
  background-color: #f1f4f3;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}
.loading {
  text-align: center;
  color: #666;
  margin: 15px 0;
  font-style: italic;
}
`;
