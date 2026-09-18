import React, { useState } from 'react';
import {
  WorkItemUnderstandingResult,
  ContextCompilerResult,
  DebuggingAgentResult
} from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { JsonViewer } from './JsonViewer';
import {
  Workflow,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Bug,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Play,
  Loader2,
  GitPullRequest,
  Check,
  ShieldAlert
} from 'lucide-react';

export const PipelineSimulationTab: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationGateStatus, setValidationGateStatus] = useState<'fail' | 'pass'>('fail');
  const [loadingStep, setLoadingStep] = useState<number | null>(null);

  // Stored state across pipeline stages
  const [workItemText, setWorkItemText] = useState<string>(
    'Add token expiration verification to auth/token_service.py using RFC 7519 NumericDate format. Reject expired tokens with 401 Unauthorized.'
  );
  const [understandingOutput, setUnderstandingOutput] = useState<WorkItemUnderstandingResult | null>(null);
  const [contextOutput, setContextOutput] = useState<ContextCompilerResult | null>(null);
  const [debuggingOutput, setDebuggingOutput] = useState<DebuggingAgentResult | null>(null);

  // Step 1: Run Understanding
  const handleRunStep1 = async () => {
    setLoadingStep(1);
    try {
      const response = await fetch('/api/agents/work-item-understanding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workItem: workItemText })
      });
      const raw = await response.json();
      const data = raw.result || raw;
      setUnderstandingOutput(data);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStep(null);
    }
  };

  // Step 2: Run Context Compiler
  const handleRunStep2 = async () => {
    setLoadingStep(2);
    try {
      const response = await fetch('/api/agents/context-compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workItem: workItemText,
          repositoryFiles: [
            {
              path: 'auth/token_service.py',
              content: 'class TokenService:\n  def verify_token(self, token_str):\n    payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])\n    # Missing exp verification\n    return payload'
            }
          ],
          repositoryRules: 'AGENTS.md: Always use timezone-aware datetime.now(timezone.utc). Never use datetime.utcnow().',
          domainDocumentation: 'RFC 7519: "exp" identifies the expiration time. Token must be rejected if current time >= exp.',
          testFiles: [
            {
              path: 'tests/test_token_service.py',
              content: 'def test_verify_token():\n  assert svc.verify_token(token)["sub"] == "user_1"'
            }
          ]
        })
      });
      const raw = await response.json();
      const data = raw.result || raw;
      setContextOutput(data);
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStep(null);
    }
  };

  // Step 3: Run Simulated Sandbox Validation Gate
  const handleRunStep3 = () => {
    setLoadingStep(3);
    setTimeout(() => {
      setLoadingStep(null);
      if (validationGateStatus === 'fail') {
        setCurrentStep(4);
      } else {
        setCurrentStep(5); // Passed to PR Quality Gate
      }
    }, 800);
  };

  // Step 4: Run Debugging Agent on Validation Failure
  const handleRunStep4 = async () => {
    setLoadingStep(4);
    try {
      const response = await fetch('/api/agents/debugging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workItem: workItemText,
          testOutput: 'FAIL: test_token_service_rejects_expired_token\nAssertionError: Expected 401 Unauthorized, got 200 OK.',
          stackTrace: 'tests/test_token_service.py:42: in test_token_service_rejects_expired_token\n  assert res.status_code == 401\nE AssertionError: assert 200 == 401',
          sourceCode: [
            {
              path: 'auth/token_service.py',
              content: 'def verify_token(self, token_str):\n    payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])\n    # BUG: condition inverted: checks if now < payload["exp"] to raise!\n    now = datetime.now(timezone.utc).timestamp()\n    if now < payload.get("exp", 0):\n        raise TokenExpiredError("Token expired")\n    return payload'
            }
          ],
          changedFiles: [
            {
              path: 'auth/token_service.py',
              diffOrContent: '+ if now < payload.get("exp", 0):\n+ raise TokenExpiredError()'
            }
          ],
          repositoryRules: 'AGENTS.md: Always use timezone-aware datetime.now(timezone.utc).'
        })
      });
      const raw = await response.json();
      const data = raw.result || raw;
      setDebuggingOutput(data);
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setUnderstandingOutput(null);
    setContextOutput(null);
    setDebuggingOutput(null);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                SIMULATION HARNESS
              </span>
              <h2 className="text-lg font-bold text-slate-900">End-to-End Autonomous Pipeline</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Step through the full autonomous software-engineering flow. Demonstrates how Work Item Understanding informs the Context Compiler, how the compiled Evidence Pack feeds into sandbox execution, and how the Debugging Agent resolves validation gate test failures.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Flow</span>
            </button>
          </div>
        </div>

        {/* Pipeline Step Progress */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-5 text-xs font-mono">
          <div className={`p-2.5 rounded border text-center ${
            currentStep >= 1 ? 'bg-slate-900 text-white border-slate-900 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="text-[10px] block opacity-75">STAGE 1</span>
            Understanding
          </div>

          <div className={`p-2.5 rounded border text-center ${
            currentStep >= 2 ? 'bg-slate-900 text-white border-slate-900 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="text-[10px] block opacity-75">STAGE 2</span>
            Context Compiler
          </div>

          <div className={`p-2.5 rounded border text-center ${
            currentStep >= 3 ? 'bg-indigo-900 text-white border-indigo-900 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="text-[10px] block opacity-75">STAGE 3</span>
            Validation Gate
          </div>

          <div className={`p-2.5 rounded border text-center ${
            currentStep >= 4 ? 'bg-rose-900 text-white border-rose-900 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="text-[10px] block opacity-75">STAGE 4</span>
            Debugging Agent
          </div>

          <div className={`p-2.5 rounded border text-center ${
            currentStep >= 5 ? 'bg-emerald-900 text-white border-emerald-900 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="text-[10px] block opacity-75">STAGE 5</span>
            Fix & Re-validate
          </div>
        </div>
      </div>

      {/* Pipeline Step Walkthrough Cards */}
      <div className="space-y-4">
        {/* Step 1 Card: Understanding */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Work Item Understanding Agent</h3>
            </div>
            {understandingOutput && (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-mono font-bold border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Requirements Extracted
              </span>
            )}
          </div>

          <div className="mt-3 text-xs">
            <label className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block mb-1">
              Input Task:
            </label>
            <p className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
              {workItemText}
            </p>

            {understandingOutput ? (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50/40 rounded border border-indigo-200">
                    <span className="font-bold text-indigo-950 block mb-1">Extracted Requirements:</span>
                    <ul className="list-disc list-inside text-indigo-900 space-y-0.5 text-[11px]">
                      {understandingOutput.requirements.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 bg-emerald-50/40 rounded border border-emerald-200">
                    <span className="font-bold text-emerald-950 block mb-1">Acceptance Criteria:</span>
                    <ul className="list-disc list-inside text-emerald-900 space-y-0.5 text-[11px]">
                      {understandingOutput.acceptance_criteria.map((ac, i) => <li key={i}>{ac}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  onClick={handleRunStep1}
                  disabled={loadingStep === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {loadingStep === 1 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Requirements...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Stage 1: Work Item Understanding</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 Card: Context Compiler */}
        {currentStep >= 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Context Compiler (Evidence Pack Generation)</h3>
              </div>
              {contextOutput && (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-mono font-bold border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Evidence Pack Compiled
                </span>
              )}
            </div>

            <div className="mt-3 text-xs">
              {contextOutput ? (
                <div className="space-y-3">
                  <p className="text-slate-800 font-medium">{contextOutput.evidence_pack_summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">Ranked Files:</span>
                      <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                        {contextOutput.relevant_files.map((rf, i) => (
                          <li key={i}>• {rf.path} ({(rf.relevance_score * 100).toFixed(0)}%)</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">Repository Rules:</span>
                      <ul className="space-y-1 text-[11px] text-slate-700">
                        {contextOutput.repository_rules.map((rr, i) => (
                          <li key={i}>• {rr}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRunStep2}
                  disabled={loadingStep === 2}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {loadingStep === 2 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling Context Pack...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Stage 2: Context Compiler</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3 Card: Simulated Sandbox Validation Gate */}
        {currentStep >= 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Isolated Dev Sandbox & Validation Gate (Source of Truth)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Simulated Outcome:</span>
                <button
                  onClick={() => setValidationGateStatus('fail')}
                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                    validationGateStatus === 'fail' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Test Fail (Triggers Debugger)
                </button>
                <button
                  onClick={() => setValidationGateStatus('pass')}
                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                    validationGateStatus === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Test Pass (Direct to PR)
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Code implementation was generated based on the Evidence Pack and executed in an isolated Linux container sandbox. The Validation Gate executes unit tests and checks types.
              </p>

              {currentStep === 3 && (
                <button
                  onClick={handleRunStep3}
                  disabled={loadingStep === 3}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {loadingStep === 3 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Real Sandbox Validation Gate...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Execute Sandbox Validation Gate</span>
                    </>
                  )}
                </button>
              )}

              {currentStep > 3 && (
                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded space-y-1">
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span>FAIL: test_token_service_rejects_expired_token</span>
                    <span>HTTP 200 != HTTP 401</span>
                  </div>
                  <p className="text-slate-400">
                    AssertionError: assert res.status_code == 401 (Observed: 200 OK)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 Card: Debugging Agent */}
        {currentStep >= 4 && validationGateStatus === 'fail' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Debugging Agent (Root Cause Analysis)</h3>
              </div>
              {debuggingOutput && (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-mono font-bold border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Root Cause Diagnosed
                </span>
              )}
            </div>

            <div className="mt-3 text-xs">
              {debuggingOutput ? (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="font-bold text-rose-950 block mb-1">Diagnosed Root Cause:</span>
                    <p className="text-rose-900 font-mono text-[11px]">{debuggingOutput.root_cause}</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-1">Minimal Surgical Fix Strategy:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700">
                      {debuggingOutput.fix_strategy.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRunStep4}
                  disabled={loadingStep === 4}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {loadingStep === 4 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Diagnosing Failure...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Stage 4: Debugging Agent</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 5 Card: Resolution & Gate Re-validation */}
        {currentStep >= 5 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-950 text-sm">
                Sandbox Re-validation & PR Quality Gate Clearance
              </h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Targeted fix applied. Sandbox validation re-executed: all unit tests passed and regression test <code>test_token_service_rejects_expired_token</code> passed with status 401. Handing off structured artifacts to the PR Generator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
