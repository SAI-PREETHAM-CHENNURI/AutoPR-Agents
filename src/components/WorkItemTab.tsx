import React, { useState } from 'react';
import { WorkItemUnderstandingResult } from '../types';
import { WORK_ITEM_PRESETS } from '../data/examplePresets';
import { EvidenceBadge } from './EvidenceBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { JsonViewer } from './JsonViewer';
import { IntegrationOutputViewer } from './IntegrationOutputViewer';
import {
  Sparkles,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Send,
  Loader2,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const WorkItemTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-users-pagination');
  const [workItemInput, setWorkItemInput] = useState<string>(WORK_ITEM_PRESETS[0].workItem);
  const [systemContext, setSystemContext] = useState<string>(WORK_ITEM_PRESETS[0].systemContext || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WorkItemUnderstandingResult | null>(null);
  const [activeSubView, setActiveSubView] = useState<'structured' | 'epistemic' | 'json'>('structured');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = WORK_ITEM_PRESETS.find(p => p.id === presetId);
    if (found) {
      setWorkItemInput(found.workItem);
      setSystemContext(found.systemContext || '');
    }
  };

  const handleAnalyze = async () => {
    if (!workItemInput.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/agents/work-item-understanding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workItem: workItemInput,
          systemContext: systemContext.trim() ? systemContext : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const raw = await response.json();
      if (raw.status === 'error') {
        setErrorMsg(raw.errors?.[0]?.message || 'Analysis failed with error.');
      }
      const data = raw.result || raw;
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze work item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab intro */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                COMPONENT 1
              </span>
              <h2 className="text-lg font-bold text-slate-900">Work Item Understanding Agent</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Ingests raw Jira/Linear software specifications. Extracts explicit functional requirements, testable acceptance criteria, and technical constraints without hallucinating unrequested limits. Detects contradictions, scope ambiguities, and flags items requiring human resolution.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {WORK_ITEM_PRESETS.map((p) => (
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

      {/* Input / Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Item Description (Jira / Linear format)
              </label>
              <textarea
                value={workItemInput}
                onChange={(e) => setWorkItemInput(e.target.value)}
                rows={5}
                placeholder="e.g. Add pagination to the /users API. Default page size should be 20..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional System Context / Architecture Notes
              </label>
              <textarea
                value={systemContext}
                onChange={(e) => setSystemContext(e.target.value)}
                rows={3}
                placeholder="e.g. User service handles 50,000 active customer records..."
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Model: gemini-3.8-flash (Strict JSON Schema)
              </span>
              <button
                onClick={handleAnalyze}
                disabled={loading || !workItemInput.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Analyze Work Item</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rules & Invariants card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Engineering Reasoning Invariants</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed text-[11px]">
              <li><strong>Zero Invention:</strong> Never invent arbitrary bounds or schemas not requested.</li>
              <li><strong>Strict Separation:</strong> Facts are separated from assumptions and unknowns.</li>
              <li><strong>Testable ACs:</strong> Acceptance criteria must be empirically verifiable in a sandbox.</li>
              <li><strong>Contradiction Escalation:</strong> Conflicting requirements immediately request human review.</li>
            </ul>
          </div>
        </div>

        {/* Right: Agent Reasoning & Structured Output */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm">No analysis performed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select a preset or enter a Jira work item description on the left, then click &ldquo;Analyze Work Item&rdquo;.
              </p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                Run Default Preset
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-800">Autonomous Reasoning in Progress...</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Synthesizing explicit requirements, auditing ambiguities, and structuring acceptance criteria.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Human Escalation Warning if flagged */}
              {result.human_investigation_required && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-900 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950">
                        Human Investigation Required Before Code Generation
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        {result.reason_for_escalation || 'Critical ambiguity or conflicting requirements detected. Automated implementation is suspended until engineering clarification is provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Summary Bar with Confidence */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Work Item Summary
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{result.summary}</h3>
                  </div>
                  <div className="w-full sm:w-64 shrink-0">
                    <ConfidenceMeter confidence={result.confidence} />
                  </div>
                </div>

                {/* Sub-view switcher */}
                <div className="flex items-center gap-2 mt-3 pt-1">
                  <button
                    onClick={() => setActiveSubView('structured')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeSubView === 'structured'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Structured Requirements
                  </button>
                  <button
                    onClick={() => setActiveSubView('epistemic')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeSubView === 'epistemic'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Epistemic Audit (Fact/Inference/Assumption)
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

              {/* Tab View 1: Structured Breakdown */}
              {activeSubView === 'structured' && (
                <div className="space-y-4">
                  {/* Requirements & Acceptance Criteria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Explicit Functional Requirements ({result.requirements.length})
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Testable Acceptance Criteria ({result.acceptance_criteria.length})
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.acceptance_criteria.map((ac, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span>{ac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ambiguities & Missing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Detected Ambiguities ({result.ambiguities.length})
                        </h4>
                      </div>
                      {result.ambiguities.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No major ambiguities detected.</p>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {result.ambiguities.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                        <HelpCircle className="w-4 h-4 text-rose-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Missing Information ({result.missing_information.length})
                        </h4>
                      </div>
                      {result.missing_information.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No critical information missing.</p>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {result.missing_information.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Components, Constraints, and Required Tests */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Technical Boundaries & Sandbox Validation Tests
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">Affected Components</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                          {result.affected_components.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">Constraints</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                          {result.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="font-semibold text-slate-800 block mb-1">Required Tests</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                          {result.required_tests.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab View 2: Epistemic Classification */}
              {activeSubView === 'epistemic' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Epistemic Grounding Classification
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Strict categorization of claims to prevent hallucinations from propagating into the sandbox execution phase.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* FACTS */}
                    <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <EvidenceBadge category="FACT" size="md" />
                        <span className="text-[11px] text-emerald-800 font-medium">Directly Grounded in Work Item</span>
                      </div>
                      <ul className="space-y-1 text-xs text-emerald-950 font-mono">
                        {(result.epistemic_classification?.facts || result.requirements).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* INFERENCES */}
                    <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <EvidenceBadge category="INFERENCE" size="md" />
                        <span className="text-[11px] text-indigo-800 font-medium">Derived from Known Architecture</span>
                      </div>
                      <ul className="space-y-1 text-xs text-indigo-950 font-mono">
                        {(result.epistemic_classification?.inferences || result.implementation_considerations).map((inf, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{inf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ASSUMPTIONS */}
                    <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <EvidenceBadge category="ASSUMPTION" size="md" />
                        <span className="text-[11px] text-amber-800 font-medium">Unconfirmed Hypotheses</span>
                      </div>
                      {result.assumptions.length === 0 ? (
                        <p className="text-xs text-amber-800 italic">No unconfirmed assumptions made.</p>
                      ) : (
                        <ul className="space-y-1 text-xs text-amber-950 font-mono">
                          {result.assumptions.map((assump, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{assump}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* UNKNOWNS */}
                    <div className="border border-rose-200 rounded-lg p-3 bg-rose-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <EvidenceBadge category="UNKNOWN" size="md" />
                        <span className="text-[11px] text-rose-800 font-medium">Missing Parameters or Constraints</span>
                      </div>
                      {result.missing_information.length === 0 ? (
                        <p className="text-xs text-rose-800 italic">No critical unknowns identified.</p>
                      ) : (
                        <ul className="space-y-1 text-xs text-rose-950 font-mono">
                          {result.missing_information.map((unk, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold">•</span>
                              <span>{unk}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab View 3: Strict JSON Output */}
              {activeSubView === 'json' && (
                <JsonViewer
                  data={result}
                  title="WorkItemUnderstandingOutput (STRICT JSON)"
                  badge="Orchestration Schema"
                />
              )}

              {/* Integration Output Section */}
              <IntegrationOutputViewer
                endpoint="/api/agents/work-item-understanding"
                payload={result}
                componentName="WorkItemUnderstanding"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
