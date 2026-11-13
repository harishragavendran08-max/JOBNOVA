import React, { useEffect, useMemo, useState } from 'react';
import {
  FileCode,
  Play,
  RotateCcw,
  Terminal,
  Trash2
} from 'lucide-react';
import {
  compileWebSandboxDocument,
  WEB_SANDBOX_PRESETS,
  WebSandboxPreset
} from '../utils/fullStackCodeLabLogic';

interface ConsoleLogEntry {
  id: number;
  level: 'log' | 'warn' | 'error';
  message: string;
}

type EditorPane = 'html' | 'css' | 'js';

export const WebSandboxStudio: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(WEB_SANDBOX_PRESETS[0].id);
  const [activePane, setActivePane] = useState<EditorPane>('html');
  const [htmlCode, setHtmlCode] = useState<string>(WEB_SANDBOX_PRESETS[0].html);
  const [cssCode, setCssCode] = useState<string>(WEB_SANDBOX_PRESETS[0].css);
  const [jsCode, setJsCode] = useState<string>(WEB_SANDBOX_PRESETS[0].js);
  const [runNonce, setRunNonce] = useState<number>(1);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'JOBNOVA_SANDBOX_CONSOLE') {
        setConsoleLogs((prev) => [
          ...prev.slice(-24),
          {
            id: Date.now() + Math.random(),
            level: event.data.level || 'log',
            message: String(event.data.message || '')
          }
        ]);
      } else if (event.data && event.data.type === 'JOBNOVA_SANDBOX_FETCH_REQ') {
        const { reqId, url, options } = event.data;
        try {
          const res = await fetch(String(url), options);
          const data = await res.json();
          event.source?.postMessage(
            { type: 'JOBNOVA_SANDBOX_FETCH_RES', reqId, ok: res.ok, status: res.status, data },
            { targetOrigin: '*' }
          );
        } catch (err) {
          event.source?.postMessage(
            {
              type: 'JOBNOVA_SANDBOX_FETCH_RES',
              reqId,
              ok: false,
              status: 500,
              error: err instanceof Error ? err.message : 'Fetch error'
            },
            { targetOrigin: '*' }
          );
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const compiledSrcDoc = useMemo(
    () =>
      compileWebSandboxDocument({
        html: htmlCode,
        css: cssCode,
        js: jsCode
      }),
    // Re-compile immediately when editing or clicking Run
    [htmlCode, cssCode, jsCode, runNonce]
  );

  const handleLoadPreset = (preset: WebSandboxPreset) => {
    setSelectedPresetId(preset.id);
    setHtmlCode(preset.html);
    setCssCode(preset.css);
    setJsCode(preset.js);
    setConsoleLogs([]);
    setRunNonce((n) => n + 1);
  };

  const handleRunCode = () => {
    setConsoleLogs([]);
    setRunNonce((n) => n + 1);
  };

  const handleResetPreset = () => {
    const current =
      WEB_SANDBOX_PRESETS.find((p) => p.id === selectedPresetId) || WEB_SANDBOX_PRESETS[0];
    handleLoadPreset(current);
  };

  const currentEditorValue =
    activePane === 'html' ? htmlCode : activePane === 'css' ? cssCode : jsCode;

  const handleEditorChange = (val: string) => {
    if (activePane === 'html') setHtmlCode(val);
    else if (activePane === 'css') setCssCode(val);
    else setJsCode(val);
  };

  return (
    <div className="space-y-4" data-testid="web-sandbox-studio">
      {/* Studio Toolbar & Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <FileCode className="w-4 h-4" />
            <span>HTML5 · CSS3 · Vanilla JavaScript Live Studio</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Edit semantic HTML5, modern CSS3 Grid/Flexbox, and JavaScript side by side with live REST API <code className="font-mono">fetch()</code> and console output capture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {WEB_SANDBOX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              data-testid={`web-preset-${preset.id}`}
              onClick={() => handleLoadPreset(preset)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: 3-Pane Editor + Live Preview & Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: HTML5 / CSS3 / JS Tabbed Code Editor */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" role="tablist" aria-label="Frontend language tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePane === 'html'}
                  data-testid="web-sandbox-tab-html"
                  onClick={() => setActivePane('html')}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                    activePane === 'html'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  index.html
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePane === 'css'}
                  data-testid="web-sandbox-tab-css"
                  onClick={() => setActivePane('css')}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                    activePane === 'css'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  styles.css
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePane === 'js'}
                  data-testid="web-sandbox-tab-js"
                  onClick={() => setActivePane('js')}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                    activePane === 'js'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  app.js
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPreset}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  data-testid="web-sandbox-run-btn"
                  onClick={handleRunCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Code</span>
                </button>
              </div>
            </div>

            <label htmlFor="web-sandbox-editor" className="sr-only">
              {activePane.toUpperCase()} Code Editor
            </label>
            <textarea
              id="web-sandbox-editor"
              data-testid="web-sandbox-textarea"
              rows={15}
              value={currentEditorValue}
              onChange={(e) => handleEditorChange(e.target.value)}
              className="w-full p-3.5 font-mono text-xs bg-slate-950 text-cyan-300 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Editing <strong className="font-mono">{activePane === 'html' ? 'index.html' : activePane === 'css' ? 'styles.css' : 'app.js'}</strong>
            </span>
            <span className="font-mono">
              HTML {htmlCode.length}ch · CSS {cssCode.length}ch · JS {jsCode.length}ch
            </span>
          </div>
        </div>

        {/* Right: Live Rendered Preview + Console Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Rendered Output
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Sandboxed HTML5 + CSS3 + JS
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white min-h-[300px]">
              <iframe
                key={runNonce}
                title="Frontend Sandbox Live Render"
                data-testid="web-sandbox-iframe"
                srcDoc={compiledSrcDoc}
                sandbox="allow-scripts"
                className="w-full h-80 border-none"
              />
            </div>
          </div>

          {/* Captured JavaScript Console */}
          <div
            data-testid="web-sandbox-console"
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>JavaScript Console ({consoleLogs.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-500 text-[11px]">
                  No console output yet — use console.log(...) in app.js or click Run Code.
                </div>
              ) : (
                consoleLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className={`px-2 py-1 rounded ${
                      entry.level === 'error'
                        ? 'bg-rose-950/70 text-rose-300'
                        : entry.level === 'warn'
                        ? 'bg-amber-950/70 text-amber-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    <span className="opacity-60 mr-2">&gt;</span>
                    <span>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
