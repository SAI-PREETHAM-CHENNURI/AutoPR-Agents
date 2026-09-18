import React, { useState } from 'react';
import { ContextCompilerResult } from '../types';
import { CONTEXT_COMPILER_PRESETS } from '../data/examplePresets';
import { EvidenceBadge } from './EvidenceBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { JsonViewer } from './JsonViewer';
import { IntegrationOutputViewer } from './IntegrationOutputViewer';
import {
  FileCode,
  Sparkles,
  BookOpen,
  FileText,
  TestTube,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowDownCircle
} from 'lucide-react';

export const ContextCompilerTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-token-expiration');
  const [workItem, setWorkItem] = useState<string>(CONTEXT_COMPILER_PRESETS[0].workItem);
  const [repositoryFiles, setRepositoryFiles] = useState<{ path: string; content: string }[]>(
    CONTEXT_COMPILER_PRESETS[0].repositoryFiles
  );
  const [repositoryRules, setRepositoryRules] = useState<string>(CONTEXT_COMPILER_PRESETS[0].repositoryRules);
  const [domainDocumentation, setDomainDocumentation] = useState<string>(CONTEXT_COMPILER_PRESETS[0].domainDocumentation);
  const [testFiles, setTestFiles] = useState<{ path: string; content: string }[]>(
    CONTEXT_COMPILER_PRESETS[0].testFiles
  );

  const [activeTabSubView, setActiveTabSubView] = useState<'evidence-pack' | 'ranked-files' | 'json'>('evidence-pack');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ContextCompilerResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = CONTEXT_COMPILER_PRESETS.find(p => p.id === presetId);
    if (found) {
      setWorkItem(found.workItem);
      setRepositoryFiles([...found.repositoryFiles]);
      setRepositoryRules(found.repositoryRules);
      setDomainDocumentation(found.domainDocumentation);
      setTestFiles([...found.testFiles]);
    }
  };

  const handleAddRepoFile = () => {
    setRepositoryFiles([
      ...repositoryFiles,
      { path: `src/module_${repositoryFiles.length + 1}.py`, content: '# New file content' }
    ]);
  };

  const handleRemoveRepoFile = (index: number) => {
    setRepositoryFiles(repositoryFiles.filter((_, i) => i !== index));
  };

  const handleCompile = async () => {
    if (!workItem.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/agents/context-compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workItem,
          repositoryFiles,
          repositoryRules,
          domainDocumentation,
          testFiles
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const raw = await response.json();
      if (raw.status === 'error') {
        setErrorMsg(raw.errors?.[0]?.message || 'Context compilation failed with error.');
      }
      const data = raw.result || raw;
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to compile context.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                COMPONENT 2
              </span>
              <h2 className="text-lg font-bold text-slate-900">Context Compiler Agent</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Synthesizes raw work items, repository source files, repository rules (AGENTS.md), domain specifications (RFCs), and unit test suites into a ranked, high-value Evidence Pack for the Implementation Agent.
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {CONTEXT_COMPILER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  selectedPresetId === p.id
                    ? 'bg-slate-900 text-white border-slate-900 font-medium'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input / Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Multi-source Context Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Work Item Target */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Task Specification
            </label>
            <textarea
              value={workItem}
              onChange={(e) => setWorkItem(e.target.value)}
              rows={3}
              placeholder="Work item description..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Repository Files Accordion */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Repository Files ({repositoryFiles.length})</span>
              </label>
              <button
                onClick={handleAddRepoFile}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add File</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {repositoryFiles.map((file, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={file.path}
                      onChange={(e) => {
                        const updated = [...repositoryFiles];
                        updated[idx].path = e.target.value;
                        setRepositoryFiles(updated);
                      }}
                      className="font-mono text-[11px] font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 w-full"
                    />
                    <button
                      onClick={() => handleRemoveRepoFile(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={file.content}
                    onChange={(e) => {
                      const updated = [...repositoryFiles];
                      updated[idx].content = e.target.value;
                      setRepositoryFiles(updated);
                    }}
                    rows={4}
                    className="w-full text-[11px] font-mono p-2 bg-white border border-slate-200 rounded focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Repository Rules (AGENTS.md) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Repository Rules (AGENTS.md / CONTRIBUTING.md)</span>
            </label>
            <textarea
              value={repositoryRules}
              onChange={(e) => setRepositoryRules(e.target.value)}
              rows={4}
              placeholder="e.g. Always use timezone-aware datetime.now(timezone.utc)..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Domain Documentation & Tests */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>4. Domain Documentation (RFCs, Protocols)</span>
              </label>
              <textarea
                value={domainDocumentation}
                onChange={(e) => setDomainDocumentation(e.target.value)}
                rows={3}
                placeholder="e.g. RFC 7519 JSON Web Token specs..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <TestTube className="w-3.5 h-3.5 text-indigo-600" />
                <span>5. Existing Test Files</span>
              </label>
              <div className="space-y-1.5">
                {testFiles.map((tf, i) => (
                  <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                    <span className="font-mono font-semibold text-slate-800 text-[11px] block">{tf.path}</span>
                    <pre className="text-[10px] text-slate-600 mt-1 max-h-24 overflow-y-auto">{tf.content}</pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCompile}
                disabled={loading || !workItem.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Context...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Compile Context Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Compiled Evidence Pack Output */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm">No context compiled yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select a preset or provide repository files, rules, and task specifications, then click &ldquo;Compile Context Pack&rdquo;.
              </p>
              <button
                onClick={handleCompile}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                Run Token Expiration Preset
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-800">Ranking Code Evidence & Audit Rules...</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Evaluating relevance scores, linking AGENTS.md rules, and synthesizing implementation constraints.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Human escalation banner if critical context missing */}
              {result.human_investigation_required && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-900 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950">
                        Context Incomplete: Human Clarification Required
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        {result.reason_for_escalation || 'Critical architectural documentation or contracts are missing. Implementation agent cannot safely proceed without guessing.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Evidence Pack Summary
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{result.evidence_pack_summary}</h3>
                  </div>
                  <div className="w-full sm:w-64 shrink-0">
                    <ConfidenceMeter confidence={result.confidence} label="Context Grounding" />
                  </div>
                </div>

                {/* Sub-view navigation */}
                <div className="flex items-center gap-2 mt-3 pt-1">
                  <button
                    onClick={() => setActiveTabSubView('evidence-pack')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeTabSubView === 'evidence-pack'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Ranked Evidence & Rules
                  </button>
                  <button
                    onClick={() => setActiveTabSubView('ranked-files')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeTabSubView === 'ranked-files'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Relevant Files ({result.relevant_files.length})
                  </button>
                  <button
                    onClick={() => setActiveTabSubView('json')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeTabSubView === 'json'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Strict JSON Output
                  </button>
                </div>
              </div>

              {/* Sub-view 1: Evidence Pack & Rules */}
              {activeTabSubView === 'evidence-pack' && (
                <div className="space-y-4">
                  {/* Evidence Items */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Ranked Evidence Claims ({result.evidence.length})
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Traceable to code & rules
                      </span>
                    </div>

                    <div className="space-y-3">
                      {result.evidence.map((item, i) => (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold text-slate-900 text-[11px] flex items-center gap-1.5">
                              <span className="text-slate-400">Source:</span>
                              <code className="bg-slate-200/60 px-1 py-0.5 rounded text-indigo-900">
                                {item.source}
                              </code>
                            </span>
                            <EvidenceBadge category={item.category || 'FACT'} />
                          </div>

                          <p className="text-slate-800 font-medium">{item.claim}</p>

                          <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-2 rounded max-h-20 overflow-x-auto">
                            <code>{item.supporting_excerpt}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Repository Rules & Implementation Constraints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Active Repository Rules ({result.repository_rules.length})
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.repository_rules.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Implementation Constraints
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.implementation_constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Existing Patterns & Relevant Tests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Existing Architectural Patterns
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                        {result.existing_patterns.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Relevant Test Suites
                      </h4>
                      <ul className="space-y-1 text-xs font-mono text-slate-700 list-disc list-inside">
                        {result.relevant_tests.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Missing Context */}
                  {result.missing_context.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950 mb-1">
                        Identified Missing Context
                      </h4>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.missing_context.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view 2: Ranked Files */}
              {activeTabSubView === 'ranked-files' && (
                <div className="space-y-3">
                  {result.relevant_files.map((file, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono">
                            #{i + 1}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{file.path}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-mono">Relevance:</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-bold text-xs rounded border border-indigo-200">
                            {(file.relevance_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{file.reason}</p>

                      {file.relevant_sections && file.relevant_sections.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-600">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Relevant Sections:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {file.relevant_sections.map((sec, idx) => (
                              <li key={idx}>{sec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-view 3: Strict JSON */}
              {activeTabSubView === 'json' && (
                <JsonViewer
                  data={result}
                  title="ContextCompilerOutput (STRICT JSON)"
                  badge="Implementation Agent Evidence Pack"
                />
              )}

              {/* Integration Output */}
              <IntegrationOutputViewer
                endpoint="/api/agents/context-compiler"
                payload={result}
                componentName="ContextCompiler"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
