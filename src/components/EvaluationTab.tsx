import React, { useState } from 'react';
import { EVALUATION_CASES } from '../data/evaluationCases';
import { EvaluationCase, EvaluationResult } from '../types';
import { JsonViewer } from './JsonViewer';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Search,
  Layers,
  Bug,
  HelpCircle,
  Check,
  ChevronRight,
  Filter,
  Flame,
  Award
} from 'lucide-react';

export const EvaluationTab: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(EVALUATION_CASES[0].id);
  const [results, setResults] = useState<Record<string, EvaluationResult>>({});
  const [runningAll, setRunningAll] = useState<boolean>(false);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedCase = EVALUATION_CASES.find(c => c.id === selectedCaseId) || EVALUATION_CASES[0];
  const activeResult = results[selectedCase.id];

  const handleRunCase = async (testCase: EvaluationCase) => {
    setRunningCaseId(testCase.id);
    try {
      const response = await fetch('/api/evaluate/run-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: testCase })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const resData: EvaluationResult = await response.json();
      setResults(prev => ({ ...prev, [testCase.id]: resData }));
    } catch (err: any) {
      console.error('Run case failed:', err);
    } finally {
      setRunningCaseId(null);
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    for (const testCase of EVALUATION_CASES) {
      setRunningCaseId(testCase.id);
      try {
        const response = await fetch('/api/evaluate/run-case', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseData: testCase })
        });
        const resData: EvaluationResult = await response.json();
        setResults(prev => ({ ...prev, [testCase.id]: resData }));
      } catch (err) {
        console.error('Case evaluation error:', err);
      }
    }
    setRunningCaseId(null);
    setRunningAll(false);
  };

  // Metrics computation
  const evaluatedCount = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => r.passed).length;
  const totalCases = EVALUATION_CASES.length;
  const passRate = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0;
  const avgScore = evaluatedCount > 0
    ? Math.round(Object.values(results).reduce((acc, r) => acc + r.score, 0) / evaluatedCount)
    : 0;

  const filteredCases = EVALUATION_CASES.filter(c => {
    if (categoryFilter === 'all') return true;
    return c.targetAgent === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Benchmark Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded border border-indigo-200">
                BENCHMARK HARNESS
              </span>
              <h2 className="text-lg font-bold text-slate-900">Agent Reasoning Evaluation Suite</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Empirical evaluation across the 10 mandatory test categories. Verifies requirement extraction accuracy, tests against ungrounded hallucinations, validates strict JSON output compliance, and checks appropriate human escalation.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              onClick={handleRunAll}
              disabled={runningAll}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {runningAll ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Evaluating Suite...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run All 10 Test Cases</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 text-[11px] block">Test Cases Evaluated</span>
            <span className="font-mono font-bold text-base text-slate-900">
              {evaluatedCount} / {totalCases}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 text-[11px] block">Pass Rate</span>
            <span className={`font-mono font-bold text-base ${passRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {evaluatedCount > 0 ? `${passRate}%` : '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 text-[11px] block">Average Grounding Score</span>
            <span className="font-mono font-bold text-base text-slate-900">
              {evaluatedCount > 0 ? `${avgScore} / 100` : '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 text-[11px] block">Hallucination Checks</span>
            <span className="font-mono font-bold text-base text-emerald-600">
              Strictly Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cases List vs Detailed Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 10 Test Cases List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Evaluation Cases (10)
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-xs"
                >
                  <option value="all">All Agents</option>
                  <option value="work-item">Work Item</option>
                  <option value="context-compiler">Context</option>
                  <option value="debugging">Debugging</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredCases.map((tc) => {
                const res = results[tc.id];
                const isSelected = selectedCase.id === tc.id;
                const isRunning = runningCaseId === tc.id;

                return (
                  <div
                    key={tc.id}
                    onClick={() => setSelectedCaseId(tc.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                        : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1 py-0.2 bg-slate-200 text-slate-800 rounded">
                          #{tc.categoryNumber}
                        </span>
                        <span className="font-semibold text-slate-900 text-[11px] truncate max-w-[180px]">
                          {tc.categoryName}
                        </span>
                      </div>

                      {isRunning ? (
                        <Activity className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                      ) : res ? (
                        res.passed ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            <Check className="w-3 h-3" /> PASS ({res.score})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            FAIL ({res.score})
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">UNTESTED</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 truncate">{tc.title}</p>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/50 text-[10px] text-slate-500 font-mono">
                      <span>Agent: {tc.targetAgent}</span>
                      {tc.expectedBehavior.shouldEscalate && (
                        <span className="text-amber-700 font-medium">Escalation Expected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Case Details & Report */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Case Top Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                    CATEGORY #{selectedCase.categoryNumber}
                  </span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Agent: {selectedCase.targetAgent}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{selectedCase.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunCase(selectedCase)}
                  disabled={runningCaseId === selectedCase.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {runningCaseId === selectedCase.id ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Case #{selectedCase.categoryNumber}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Input & Ground Truth Expected Behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Input Data
                </span>
                <div className="font-mono text-[11px] text-slate-800 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedCase.inputData, null, 2)}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-lg space-y-1">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px] block">
                  Expected Behavior & Verification Rubric
                </span>
                <p className="text-indigo-950 text-[11px] leading-relaxed">
                  {selectedCase.expectedBehavior.description}
                </p>
                <div className="pt-1 text-[10px] text-indigo-800 space-y-0.5">
                  <div><strong>Must Contain:</strong> {selectedCase.expectedBehavior.mustContain.join(', ')}</div>
                  <div><strong>Must NOT Invent:</strong> {selectedCase.expectedBehavior.mustNotInvent.join(', ')}</div>
                  <div><strong>Human Escalation Expected:</strong> {selectedCase.expectedBehavior.shouldEscalate ? 'YES' : 'NO'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Evaluation Result Card */}
          {activeResult ? (
            <div className="space-y-4">
              {/* Scorecard */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {activeResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {activeResult.passed ? 'Evaluation PASSED' : 'Evaluation FAILED'}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Score: {activeResult.score} / 100 • {activeResult.executionNote}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 rounded border border-slate-300">
                      Output Valid: {activeResult.structuredOutputValidity ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[11px] text-slate-500 block">Requirement Extraction</span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeResult.requirementExtractionAccuracy}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[11px] text-slate-500 block">Evidence Grounding</span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeResult.evidenceGroundingScore}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[11px] text-slate-500 block">Root Cause Accuracy</span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeResult.rootCauseAccuracy}
                    </span>
                  </div>
                </div>

                {/* Detected Hallucinations */}
                {activeResult.hallucinationsDetected.length > 0 && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                    <h5 className="font-bold flex items-center gap-1.5 text-rose-950 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hallucinations Detected:</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-0.5">
                      {activeResult.hallucinationsDetected.map((h: string, i: number) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Info */}
                {activeResult.missingInformation.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <h5 className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Missing Elements:</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-0.5">
                      {activeResult.missingInformation.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model Output JSON */}
              <JsonViewer
                data={activeResult.modelOutput}
                title={`Evaluation Output: ${selectedCase.title}`}
                badge="Model Generated Output"
              />
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700">Case #{selectedCase.categoryNumber} has not been run yet.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click &ldquo;Run Case #{selectedCase.categoryNumber}&rdquo; above or &ldquo;Run All 10 Test Cases&rdquo; to benchmark.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
