import React, { useState } from 'react';
import { DebuggingAgentResult } from '../types';
import { DEBUGGING_PRESETS } from '../data/examplePresets';
import { EvidenceBadge } from './EvidenceBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { JsonViewer } from './JsonViewer';
import { IntegrationOutputViewer } from './IntegrationOutputViewer';
import {
  Bug,
  AlertTriangle,
  FileCode,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Loader2,
  CheckCircle2,
  GitBranch,
  Wrench,
  Terminal,
  Activity
} from 'lucide-react';

export const DebuggingTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-password-reset-expired-token');
  const [workItem, setWorkItem] = useState<string>(DEBUGGING_PRESETS[0].workItem);
  const [testOutput, setTestOutput] = useState<string>(DEBUGGING_PRESETS[0].testOutput);
  const [stackTrace, setStackTrace] = useState<string>(DEBUGGING_PRESETS[0].stackTrace);
  const [buildOutput, setBuildOutput] = useState<string>('');
  const [lintOutput, setLintOutput] = useState<string>('');
  const [typeCheckOutput, setTypeCheckOutput] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<{ path: string; content: string }[]>(
    DEBUGGING_PRESETS[0].sourceCode
  );
  const [changedFiles, setChangedFiles] = useState<{ path: string; diffOrContent: string }[]>(
    DEBUGGING_PRESETS[0].changedFiles
  );
  const [repositoryRules, setRepositoryRules] = useState<string>(DEBUGGING_PRESETS[0].repositoryRules);
  const [previousAttempts, setPreviousAttempts] = useState<string>(
    (DEBUGGING_PRESETS[0].previousAttempts || []).join('\n')
  );

  const [activeSubView, setActiveSubView] = useState<'analysis' | 'strategy' | 'json'>('analysis');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DebuggingAgentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = DEBUGGING_PRESETS.find(p => p.id === presetId);
    if (found) {
      setWorkItem(found.workItem);
      setTestOutput(found.testOutput);
      setStackTrace(found.stackTrace);
      setSourceCode([...found.sourceCode]);
      setChangedFiles([...found.changedFiles]);
      setRepositoryRules(found.repositoryRules);
      setPreviousAttempts((found.previousAttempts || []).join('\n'));
      setBuildOutput('');
      setLintOutput('');
      setTypeCheckOutput('');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/agents/debugging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workItem,
          changedFiles,
          testOutput,
          buildOutput,
          lintOutput,
          typeCheckOutput,
          stackTrace,
          sourceCode,
          repositoryRules,
          previousAttempts: previousAttempts.split('\n').filter(Boolean)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const raw = await response.json();
      if (raw.status === 'error') {
        setErrorMsg(raw.errors?.[0]?.message || 'Debugging analysis failed with error.');
      }
      const data = raw.result || raw;
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                COMPONENT 3
              </span>
              <h2 className="text-lg font-bold text-slate-900">Debugging Agent</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Analyzes real execution failure artifacts (test assertion errors, stack traces, build logs, and git diffs). Diagnoses root causes with explicit evidence grounding, checks alternative hypotheses, proposes minimal surgical fixes, and specifies regression tests.
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {DEBUGGING_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  selectedPresetId === p.id
                    ? 'bg-slate-900 text-white border-slate-900 font-medium'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {p.name.split(' ')[0]} {p.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Failure Telemetry Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Work Item */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Work Item Context
            </label>
            <input
              type="text"
              value={workItem}
              onChange={(e) => setWorkItem(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
            />
          </div>

          {/* Test & Stack Trace Telemetry */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Terminal className="w-3.5 h-3.5 text-rose-600" />
                <span>Test Failure Output</span>
              </label>
              <textarea
                value={testOutput}
                onChange={(e) => setTestOutput(e.target.value)}
                rows={4}
                placeholder="FAIL: test_xyz... AssertionError..."
                className="w-full text-[11px] font-mono p-2.5 bg-slate-900 text-rose-300 border border-slate-800 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                <span>Stack Trace</span>
              </label>
              <textarea
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                rows={4}
                placeholder="Traceback (most recent call last)..."
                className="w-full text-[11px] font-mono p-2.5 bg-slate-900 text-amber-200 border border-slate-800 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* Changed Files & Source Code */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recent Changes / Git Diff</span>
              </label>
              {changedFiles.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No git diff provided.</p>
              ) : (
                changedFiles.map((cf, i) => (
                  <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{cf.path}</span>
                    <pre className="text-[10px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                      {cf.diffOrContent}
                    </pre>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Relevant Source Files ({sourceCode.length})</span>
              </label>
              {sourceCode.map((s, i) => (
                <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs mb-2">
                  <span className="font-mono font-bold text-slate-800 text-[11px] block mb-1">{s.path}</span>
                  <pre className="text-[10px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 max-h-36 overflow-y-auto">
                    {s.content}
                  </pre>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Previous Debugging Attempts
              </label>
              <textarea
                value={previousAttempts}
                onChange={(e) => setPreviousAttempts(e.target.value)}
                rows={2}
                placeholder="e.g. Attempt 1: Changed string error message..."
                className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Diagnosing Failure...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Diagnose Root Cause</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Debugging Diagnosis & Proposed Fix Strategy */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
              <Bug className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm">No failure diagnosed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select a failure preset (such as Expired Token 200 vs 401) and click &ldquo;Diagnose Root Cause&rdquo;.
              </p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                Run Expired Token Test Failure
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-800">Analyzing Stack Trace & Code Inversion...</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Isolating failing condition, formulating alternative hypotheses, and computing minimal fix strategy.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Human Escalation Alert */}
              {result.human_investigation_required && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-900 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950">
                        Human Investigation Required Before Applying Fix
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        {result.reason_for_escalation || 'Insufficient telemetry, contradictory observations, or multiple equally plausible root causes detected. Escalating to human engineering.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis Summary Header */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold rounded border border-rose-200">
                        {result.failure_classification}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Affected: {result.affected_files.join(', ') || 'Unknown'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{result.symptom}</h3>
                  </div>
                  <div className="w-full sm:w-64 shrink-0">
                    <ConfidenceMeter confidence={result.confidence} label="Diagnosis Confidence" />
                  </div>
                </div>

                {/* Sub-view switcher */}
                <div className="flex items-center gap-2 mt-3 pt-1">
                  <button
                    onClick={() => setActiveSubView('analysis')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeSubView === 'analysis'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Root Cause & Observations
                  </button>
                  <button
                    onClick={() => setActiveSubView('strategy')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeSubView === 'strategy'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Fix Strategy & Regression Tests
                  </button>
                  <button
                    onClick={() => setActiveSubView('json')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeSubView === 'json'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Strict JSON Output
                  </button>
                </div>
              </div>

              {/* Sub-view 1: Root Cause & Observations */}
              {activeSubView === 'analysis' && (
                <div className="space-y-4">
                  {/* Root Cause Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-rose-600" />
                      <span>Likely Root Cause</span>
                    </h4>
                    <p className="text-xs text-slate-800 font-mono bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                      {result.root_cause}
                    </p>
                  </div>

                  {/* Evidence Observations */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Grounding Evidence & Observations ({result.evidence.length})
                    </h4>
                    <div className="space-y-2">
                      {result.evidence.map((ev, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800 text-[11px]">{ev.source}</span>
                            <EvidenceBadge category="FACT" />
                          </div>
                          <p className="text-slate-700 text-[11px]">{ev.observation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alternative Hypotheses */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Alternative Hypotheses Considered
                    </h4>
                    {result.alternative_hypotheses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No plausible alternative hypotheses identified.</p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.alternative_hypotheses.map((hyp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                            <span>{hyp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-view 2: Fix Strategy & Regression Tests */}
              {activeSubView === 'strategy' && (
                <div className="space-y-4">
                  {/* Proposed Fix Strategy */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Minimal Surgical Fix Strategy (Smallest Reasonable Change)
                      </h4>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-800 list-decimal list-inside">
                      {result.fix_strategy.map((step, i) => (
                        <li key={i} className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="font-medium">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Required Regression Tests */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Required Sandbox Regression Tests
                      </h4>
                    </div>
                    <ul className="space-y-1.5 text-xs font-mono text-slate-700">
                      {result.regression_tests.map((rt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{rt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                    <strong>Execution Reminder:</strong> Proposed fix strategies must be applied and validated in the Isolated Dev Sandbox. A fix is never marked as verified until real unit and regression test passes are observed by the Validation Gate.
                  </div>
                </div>
              )}

              {/* Sub-view 3: Strict JSON */}
              {activeSubView === 'json' && (
                <JsonViewer
                  data={result}
                  title="DebuggingAgentOutput (STRICT JSON)"
                  badge="Validation Gate Failure Contract"
                />
              )}

              {/* Integration Output Section */}
              <IntegrationOutputViewer
                endpoint="/api/agents/debugging"
                payload={result}
                componentName="DebuggingAgent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
