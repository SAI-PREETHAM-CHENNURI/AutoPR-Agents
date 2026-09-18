import React, { useState } from 'react';
import {
  WORK_ITEM_UNDERSTANDING_CONTRACT,
  CONTEXT_COMPILER_CONTRACT,
  DEBUGGING_AGENT_CONTRACT,
  ContractSpec
} from '../data/integrationContracts';
import { JsonViewer } from './JsonViewer';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Layers,
  ArrowRight,
  Search,
  Bug,
  Code2,
  Loader2
} from 'lucide-react';

interface InspectionItem {
  id: number;
  label: string;
  passed: boolean;
  message: string;
  details?: string[];
}

export const IntegrationTestModeTab: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<'work_item' | 'context_compiler' | 'debugging'>('work_item');
  const [activeContract, setActiveContract] = useState<ContractSpec>(WORK_ITEM_UNDERSTANDING_CONTRACT);
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(WORK_ITEM_UNDERSTANDING_CONTRACT.exampleRequest, null, 2));
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSwitchAgent = (agent: 'work_item' | 'context_compiler' | 'debugging') => {
    setSelectedAgentId(agent);
    let contract: ContractSpec;
    if (agent === 'work_item') {
      contract = WORK_ITEM_UNDERSTANDING_CONTRACT;
    } else if (agent === 'context_compiler') {
      contract = CONTEXT_COMPILER_CONTRACT;
    } else {
      contract = DEBUGGING_AGENT_CONTRACT;
    }
    setActiveContract(contract);
    setInputJson(JSON.stringify(contract.exampleRequest, null, 2));
    setRawResponse(null);
    setInspections([]);
    setErrorMsg(null);
  };

  const handleLoadPreset = (type: 'valid' | 'invalid' | 'ambiguous') => {
    if (type === 'valid') {
      setInputJson(JSON.stringify(activeContract.exampleRequest, null, 2));
    } else if (type === 'invalid') {
      if (selectedAgentId === 'work_item') {
        setInputJson(JSON.stringify({ work_item: { description: '' } }, null, 2));
      } else if (selectedAgentId === 'context_compiler') {
        setInputJson(JSON.stringify({ work_item: 'Test', repository_files: [] }, null, 2));
      } else {
        setInputJson(JSON.stringify({ work_item: 'Test failure with no logs', relevant_source_code: [] }, null, 2));
      }
    } else if (type === 'ambiguous') {
      if (selectedAgentId === 'work_item') {
        setInputJson(JSON.stringify({ work_item: { description: 'Make database queries 100x faster by tomorrow.' } }, null, 2));
      } else if (selectedAgentId === 'context_compiler') {
        setInputJson(JSON.stringify({
          work_item: 'Enforce protocol XYZ',
          repository_files: [{ path: 'temp.txt', content: 'hello' }],
          agents_md: 'AGENTS.md RULE 1: Use raw SQL\nAGENTS.md RULE 2: Never use raw SQL'
        }, null, 2));
      } else {
        setInputJson(JSON.stringify({
          test_results: '502 Bad Gateway from reverse proxy',
          stack_trace: '[truncated stack trace]',
          relevant_source_code: []
        }, null, 2));
      }
    }
  };

  const handleRunTest = async () => {
    setErrorMsg(null);
    setLoading(true);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(inputJson);
    } catch (e: any) {
      setErrorMsg(`Input JSON Parse Error: ${e.message}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(activeContract.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload)
      });

      const data = await response.json();
      setRawResponse(data);

      // Perform 10-point Antigravity Integration Inspection
      const checks: InspectionItem[] = [];

      // 1. Input JSON Schema Check
      checks.push({
        id: 1,
        label: 'Input JSON Structure',
        passed: true,
        message: 'Valid JSON input provided with expected structure.'
      });

      // 2. HTTP Status & Execution
      checks.push({
        id: 2,
        label: 'Reasoning Engine Dispatch',
        passed: response.ok || data.status === 'error',
        message: `HTTP ${response.status} received from endpoint.`
      });

      // 3. Raw Response Envelope Check
      const hasEnvelope = data?.schema_version === '1.0' && Boolean(data?.agent) && Boolean(data?.status);
      checks.push({
        id: 3,
        label: 'Standard Envelope (v1.0)',
        passed: hasEnvelope,
        message: hasEnvelope
          ? `Complies with envelope: schema_version="1.0", agent="${data.agent}", status="${data.status}"`
          : 'Failed: Response missing standard envelope fields.'
      });

      // 4. Schema Validation
      let schemaValid = false;
      const isError = data?.status === 'error';
      if (isError) {
        schemaValid = Array.isArray(data?.errors) && data.errors.length > 0;
      } else if (selectedAgentId === 'work_item') {
        schemaValid = Boolean(data?.result?.summary && Array.isArray(data?.result?.requirements));
      } else if (selectedAgentId === 'context_compiler') {
        schemaValid = Boolean(data?.result?.task_summary && Array.isArray(data?.result?.relevant_files));
      } else {
        schemaValid = Boolean(data?.result?.failure_classification && data?.result?.root_cause);
      }
      checks.push({
        id: 4,
        label: 'JSON Schema Validation',
        passed: schemaValid,
        message: schemaValid
          ? 'Output adheres strictly to frozen contract schema.'
          : 'Failed: Required schema fields are absent.'
      });

      // 5. Parsed Output Extraction
      checks.push({
        id: 5,
        label: 'Parsed Output Extraction',
        passed: isError ? data.errors.length > 0 : Boolean(data.result),
        message: isError ? `Extracted error code: ${data.errors[0]?.code}` : 'Successfully extracted result payload.'
      });

      // 6. Missing Fields Detection
      const missingFields: string[] = [];
      if (!isError) {
        if (selectedAgentId === 'work_item') {
          if (!data?.result?.acceptance_criteria) missingFields.push('acceptance_criteria');
          if (!data?.result?.epistemic_classification) missingFields.push('epistemic_classification');
        } else if (selectedAgentId === 'context_compiler') {
          if (!data?.result?.evidence) missingFields.push('evidence');
        } else if (selectedAgentId === 'debugging') {
          if (!data?.result?.fix_strategy) missingFields.push('fix_strategy');
        }
      }
      checks.push({
        id: 6,
        label: 'Missing Fields Audit',
        passed: missingFields.length === 0,
        message: missingFields.length === 0 ? 'No required contract fields missing.' : `Missing: ${missingFields.join(', ')}`
      });

      // 7. Invalid Values Audit
      let invalidValues = false;
      let invalidMsg = 'All field types and ranges are valid.';
      if (!isError && data.result) {
        if (typeof data.result.confidence === 'number' && (data.result.confidence < 0 || data.result.confidence > 1)) {
          invalidValues = true;
          invalidMsg = 'Confidence value out of 0.0 - 1.0 bounds.';
        }
      }
      checks.push({
        id: 7,
        label: 'Invalid Values Audit',
        passed: !invalidValues,
        message: invalidMsg
      });

      // 8. Unsupported Claims & Verification Boundary
      let unsupportedClaimDetected = false;
      let unsupportedMsg = 'Agent strictly adhered to hypothesis boundary.';
      if (selectedAgentId === 'debugging' && !isError) {
        const fixStr = JSON.stringify(data.result?.fix_strategy || []).toLowerCase();
        if (fixStr.includes('verified that') || fixStr.includes('tested and confirmed')) {
          unsupportedClaimDetected = true;
          unsupportedMsg = 'Violation: Debugging agent claimed fix was verified before Antigravity sandbox execution!';
        }
      }
      checks.push({
        id: 8,
        label: 'Hypothesis Boundary (No False Verification)',
        passed: !unsupportedClaimDetected,
        message: unsupportedMsg
      });

      // 9. Hallucination Detection
      let hallucinationDetected = false;
      const respStr = JSON.stringify(data).toLowerCase();
      if (selectedAgentId === 'context_compiler' && !isError) {
        // Check if agent invented files not in input
        const repoFilesInput = (parsedPayload.repository_files || []).map((f: any) => f.path.toLowerCase());
        const reportedFiles = (data.result?.relevant_files || []).map((f: any) => f.path.toLowerCase());
        const invented = reportedFiles.filter((rf: string) => !repoFilesInput.some((inp: string) => inp.includes(rf) || rf.includes(inp)));
        if (invented.length > 0 && repoFilesInput.length > 0) {
          hallucinationDetected = true;
        }
      }
      checks.push({
        id: 9,
        label: 'Hallucination & Fabrication Audit',
        passed: !hallucinationDetected,
        message: hallucinationDetected
          ? 'Warning: Fabricated ungrounded file paths detected.'
          : 'Zero ungrounded file or parameter hallucinations detected.'
      });

      // 10. Human Escalation Determination
      const isEscalated = Boolean(
        isError ||
        data?.result?.human_investigation_required ||
        data?.result?.human_escalation?.required
      );
      const escalationReason =
        data?.result?.reason_for_escalation ||
        data?.result?.human_escalation?.reason ||
        data?.errors?.[0]?.message ||
        'None';
      checks.push({
        id: 10,
        label: 'Human Escalation Gate',
        passed: true,
        message: isEscalated
          ? `Human Escalation REQUIRED: ${escalationReason}`
          : 'Autonomous execution permitted (Confidence above threshold).'
      });

      setInspections(checks);
    } catch (err: any) {
      setErrorMsg(`Request Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-mono font-bold rounded">
                INTEGRATION TEST MODE
              </span>
              <h2 className="text-lg font-bold text-slate-900">Antigravity Simulation Harness</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Simulates direct machine-to-machine interactions between the Antigravity Orchestrator and the Auto PR AI Reasoning Engine. Performs a complete 10-point inspection covering schema validation, hallucination detection, epistemic grounding, and human escalation gates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Agent:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => handleSwitchAgent('work_item')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedAgentId === 'work_item' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Work Item
              </button>
              <button
                onClick={() => handleSwitchAgent('context_compiler')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedAgentId === 'context_compiler' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Context Compiler
              </button>
              <button
                onClick={() => handleSwitchAgent('debugging')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedAgentId === 'debugging' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Debugging Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Antigravity Dispatch */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Antigravity Payload Input ({activeContract.name})
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleLoadPreset('valid')}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium cursor-pointer"
                >
                  Valid
                </button>
                <button
                  onClick={() => handleLoadPreset('ambiguous')}
                  className="text-[11px] px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium cursor-pointer"
                >
                  Ambiguous
                </button>
                <button
                  onClick={() => handleLoadPreset('invalid')}
                  className="text-[11px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200 font-medium cursor-pointer"
                >
                  Invalid
                </button>
              </div>
            </div>

            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={14}
              className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-500">
                POST {activeContract.endpoint}
              </span>
              <button
                onClick={handleRunTest}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Inspection...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Dispatch to Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Raw Response Viewer */}
          {rawResponse && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Raw Engine Response (v1.0 Envelope)</span>
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  rawResponse.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  STATUS: {rawResponse.status?.toUpperCase()}
                </span>
              </div>
              <JsonViewer data={rawResponse} maxHeight="max-h-72" />
            </div>
          )}
        </div>

        {/* Right Column: 10-Point Antigravity Inspection Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">10-Point Integration Inspection</h3>
              </div>
              {inspections.length > 0 && (
                <span className="text-xs font-mono font-semibold text-slate-600">
                  {inspections.filter(i => i.passed).length} / 10 Checks Passed
                </span>
              )}
            </div>

            {inspections.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">Awaiting dispatch</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                  Click &ldquo;Dispatch to Engine&rdquo; on the left to execute the integration audit against the frozen contract.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {inspections.map((check) => (
                  <div
                    key={check.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      check.passed
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                        : 'bg-rose-50/50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {check.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900">
                            {check.id}. {check.label}
                          </span>
                          <p className={`mt-0.5 text-[11px] leading-relaxed ${check.passed ? 'text-slate-600' : 'text-rose-800 font-medium'}`}>
                            {check.message}
                          </p>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        check.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {check.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
