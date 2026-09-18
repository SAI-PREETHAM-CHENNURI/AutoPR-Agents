import React, { useState } from 'react';
import { ADVERSARIAL_TEST_CASES } from '../data/adversarialCases';
import { AdversarialTestCase, AdversarialEvaluationResult } from '../types';
import { JsonViewer } from './JsonViewer';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Check,
  X,
  Layers,
  Search,
  Bug,
  Filter,
  Loader2
} from 'lucide-react';

export const AdversarialEvaluationTab: React.FC = () => {
  const [results, setResults] = useState<Record<string, AdversarialEvaluationResult>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [runningSingle, setRunningSingle] = useState<string | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<'all' | 'work_item' | 'context_compiler' | 'debugging'>('all');

  const runSingleCase = async (testCase: AdversarialTestCase): Promise<AdversarialEvaluationResult> => {
    try {
      const res = await fetch('/api/evaluate/adversarial-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCase })
      });
      const data: AdversarialEvaluationResult = await res.json();
      return data;
    } catch (err: any) {
      return {
        testId: testCase.id,
        caseNumber: testCase.caseNumber,
        name: testCase.name,
        targetAgent: testCase.targetAgent,
        passed: false,
        score: 0,
        reason: `Client communication error: ${err.message}`,
        hallucinationDetected: false,
        hallucinationDetails: [],
        schemaViolation: true,
        schemaViolationDetails: [err.message],
        unsupportedInference: true,
        unsupportedInferenceDetails: [],
        escalationCorrectness: false,
        escalationDetails: 'Execution failed',
        rawResponse: null
      };
    }
  };

  const handleRunSingle = async (testCase: AdversarialTestCase) => {
    setRunningSingle(testCase.id);
    const res = await runSingleCase(testCase);
    setResults(prev => ({ ...prev, [testCase.id]: res }));
    setRunningSingle(null);
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    const newResults: Record<string, AdversarialEvaluationResult> = {};

    for (const testCase of ADVERSARIAL_TEST_CASES) {
      setRunningSingle(testCase.id);
      const res = await runSingleCase(testCase);
      newResults[testCase.id] = res;
      setResults({ ...newResults });
    }

    setRunningSingle(null);
    setRunningAll(false);
  };

  const handleReset = () => {
    setResults({});
    setExpandedCaseId(null);
  };

  // Metrics computation
  const totalCount = ADVERSARIAL_TEST_CASES.length;
  const completedCount = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => r.passed).length;
  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
  const hallucinationCount = Object.values(results).filter(r => r.hallucinationDetected).length;
  const hallucinationRate = completedCount > 0 ? Math.round((hallucinationCount / completedCount) * 100) : 0;
  const schemaCompliantCount = Object.values(results).filter(r => !r.schemaViolation).length;
  const schemaComplianceRate = completedCount > 0 ? Math.round((schemaCompliantCount / completedCount) * 100) : 100;
  const escalationCorrectCount = Object.values(results).filter(r => r.escalationCorrectness).length;
  const escalationAccuracyRate = completedCount > 0 ? Math.round((escalationCorrectCount / completedCount) * 100) : 100;

  const filteredCases = ADVERSARIAL_TEST_CASES.filter(c => {
    if (filterAgent === 'all') return true;
    if (filterAgent === 'work_item') return c.targetAgent === 'work_item_understanding';
    if (filterAgent === 'context_compiler') return c.targetAgent === 'context_compiler';
    if (filterAgent === 'debugging') return c.targetAgent === 'debugging_agent';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-mono font-bold rounded">
                RELIABILITY BENCHMARK
              </span>
              <h2 className="text-lg font-bold text-slate-900">15 Adversarial Reliability Tests</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Stress-tests all three reasoning agents against missing information, contradictory requirements, fake files, missing docs, conflicting AGENTS.md rules, incomplete stack traces, deadlocks, and invalid JSON. Measures hallucination prevention and human escalation accuracy.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleReset}
              disabled={completedCount === 0 || runningAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleRunAll}
              disabled={runningAll}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {runningAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing 15 Cases...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run All 15 Adversarial Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Reliability Pass Rate</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-bold font-mono ${passRate >= 80 ? 'text-emerald-600' : completedCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {passRate}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({passedCount}/{completedCount} run)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Hallucination Rate</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-bold font-mono ${hallucinationRate === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {hallucinationRate}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({hallucinationCount} detected)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Schema Compliance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-bold font-mono ${schemaComplianceRate === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {schemaComplianceRate}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({schemaCompliantCount}/{completedCount || totalCount})
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Escalation Accuracy</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-bold font-mono ${escalationAccuracyRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {escalationAccuracyRate}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({escalationCorrectCount}/{completedCount || totalCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilterAgent('all')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              filterAgent === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 15 Tests
          </button>
          <button
            onClick={() => setFilterAgent('work_item')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              filterAgent === 'work_item' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Item (Cases 1-3, 14)
          </button>
          <button
            onClick={() => setFilterAgent('context_compiler')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              filterAgent === 'context_compiler' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Context Compiler (Cases 4-7, 13, 15)
          </button>
          <button
            onClick={() => setFilterAgent('debugging')}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              filterAgent === 'debugging' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Debugging Agent (Cases 8-12)
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredCases.length} of {ADVERSARIAL_TEST_CASES.length} test cases
        </span>
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredCases.map((tc) => {
          const res = results[tc.id];
          const isExpanded = expandedCaseId === tc.id;
          const isRunning = runningSingle === tc.id;

          return (
            <div
              key={tc.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-colors ${
                res
                  ? res.passed
                    ? 'border-emerald-200'
                    : 'border-rose-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Header row */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    #{tc.caseNumber}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{tc.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 text-[10px] font-mono font-semibold rounded">
                        {tc.targetAgent.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono rounded border border-indigo-200">
                        {tc.adversarialType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {tc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {res && (
                    <div className="flex items-center gap-2 mr-2">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        res.passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {res.passed ? 'PASS' : 'FAIL'} ({res.score}/100)
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleRunSingle(tc)}
                    disabled={isRunning || runningAll}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" />
                        <span>Run</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setExpandedCaseId(isExpanded ? null : tc.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status breakdown banner when result is available */}
              {res && (
                <div className="px-4 py-2.5 bg-white border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {res.hallucinationDetected ? (
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="text-slate-700">
                      Hallucination: {res.hallucinationDetected ? 'Detected' : 'None (Strict)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {res.schemaViolation ? (
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="text-slate-700">
                      Schema v1.0: {res.schemaViolation ? 'Violation' : 'Valid'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {res.unsupportedInference ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="text-slate-700">
                      Inference: {res.unsupportedInference ? 'Partial Match' : 'Well-Grounded'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {res.escalationCorrectness ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="text-slate-700">
                      Escalation: {res.escalationDetails}
                    </span>
                  </div>
                </div>
              )}

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Expected Reliability Behavior & Invariants:
                    </h4>
                    <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                      {tc.expectedBehavior.requiredEpistemicCheck}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Input Payload Sent by Antigravity:
                      </h4>
                      <JsonViewer data={tc.inputPayload} maxHeight="max-h-60" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Model Output & Reason:
                      </h4>
                      {res ? (
                        <div className="space-y-2">
                          <div className={`p-2.5 rounded border text-xs ${res.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                            <strong>Audit Verdict:</strong> {res.reason}
                          </div>
                          <JsonViewer data={res.rawResponse} maxHeight="max-h-48" />
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded p-4 text-slate-400 text-center">
                          Awaiting test run. Click &ldquo;Run&rdquo; above.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
