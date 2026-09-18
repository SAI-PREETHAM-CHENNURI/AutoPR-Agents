import React, { useState } from 'react';
import {
  WORK_ITEM_UNDERSTANDING_CONTRACT,
  CONTEXT_COMPILER_CONTRACT,
  DEBUGGING_AGENT_CONTRACT
} from '../data/integrationContracts';
import { JsonViewer } from './JsonViewer';
import {
  BookOpen,
  Layers,
  Search,
  Bug,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  FileCode,
  Network,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AntigravityIntegrationGuideTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navItems = [
    { id: 'architecture', title: '1. Architecture & Division of Labor' },
    { id: 'work_item_api', title: '2. Work Item Understanding API' },
    { id: 'context_compiler_api', title: '3. Context Compiler & Evidence Pack API' },
    { id: 'debugging_api', title: '4. Debugging Agent & Proposed Fix API' },
    { id: 'error_handling', title: '5. Standardized Error Handling & Codes' },
    { id: 'fields_matrix', title: '6. Mandatory vs Optional Fields Matrix' },
    { id: 'boundary_guarantees', title: '7. What AI Studio DOES NOT Verify' }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                INTEGRATION SPECIFICATION
              </span>
              <h2 className="text-lg font-bold text-slate-900">Antigravity Integration Guide v1.0</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Official developer guide for connecting the Antigravity Orchestrator to the Auto PR AI Reasoning Layer. Contains frozen JSON schemas, TypeScript interfaces, cURL commands, error codes, and strict boundary contracts.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Schema Version: 1.0 (Frozen)</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Sidebar Navigation + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Column */}
        <div className="lg:col-span-3 space-y-1">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs sticky top-20">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Guide Table of Contents
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    activeSection === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.title}</span>
                  {activeSection === item.id && <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Architecture & Division of Labor</h3>
                <p className="text-slate-500 mt-0.5">
                  Clear operational separation between AI Studio and Antigravity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>GOOGLE AI STUDIO (This Service)</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-indigo-900 text-[11px]">
                    <li><strong>Work Item Understanding:</strong> Structured requirements extraction & ambiguity detection.</li>
                    <li><strong>Context Compilation:</strong> Distilling repository files, AGENTS.md, & domain docs into ranked Evidence Packs.</li>
                    <li><strong>Root Cause Analysis:</strong> Diagnosing sandbox test failures & proposing surgical fix strategies.</li>
                    <li><strong>Epistemic Separation:</strong> Distinguishing facts, inferences, assumptions, and unknowns.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>ANTIGRAVITY (Host Orchestration)</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                    <li><strong>Orchestration & Workflow:</strong> Stage-by-stage pipeline management.</li>
                    <li><strong>Code Execution & Sandbox:</strong> Running builds, linters, tests, and compilers in isolated containers.</li>
                    <li><strong>Git & GitHub Operations:</strong> Branch creation, commits, worktrees, and PR generation.</li>
                    <li><strong>Final Validation Authority:</strong> Real sandbox execution is the only true proof of a fix.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950">
                    The Central Engineering Invariant
                  </h4>
                  <p className="mt-1 leading-relaxed text-amber-800">
                    <strong>AI reasoning &ne; verification.</strong> The AI Reasoning Layer outputs structured engineering hypotheses. Antigravity&rsquo;s isolated execution sandbox remains the sole and final validation authority. No fix is verified until Antigravity executes tests that pass.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WORK ITEM UNDERSTANDING API */}
          {activeSection === 'work_item_api' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">2. Work Item Understanding Contract</h3>
                  <p className="text-slate-500 mt-0.5">
                    Endpoint: <code className="font-mono text-indigo-600 font-bold">POST /api/agents/work-item-understanding</code>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('wi_curl', WORK_ITEM_UNDERSTANDING_CONTRACT.curlSnippet)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {copiedKey === 'wi_curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Copy cURL</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Request Payload Format:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(WORK_ITEM_UNDERSTANDING_CONTRACT.exampleRequest, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Standard Success Response (v1.0 Envelope):</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(WORK_ITEM_UNDERSTANDING_CONTRACT.exampleResponse, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">TypeScript Integration Interface:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{WORK_ITEM_UNDERSTANDING_CONTRACT.typeScriptSnippet}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CONTEXT COMPILER API */}
          {activeSection === 'context_compiler_api' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">3. Context Compiler & Evidence Pack Contract</h3>
                  <p className="text-slate-500 mt-0.5">
                    Endpoint: <code className="font-mono text-indigo-600 font-bold">POST /api/agents/context-compiler</code>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('cc_curl', CONTEXT_COMPILER_CONTRACT.curlSnippet)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {copiedKey === 'cc_curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Copy cURL</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Core Transformation Principle:</h4>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg font-mono text-[11px] text-indigo-950 font-bold text-center">
                  REQUIREMENTS + CODE + REPO RULES (AGENTS.md) + DOMAIN DOCS &rarr; RANKED EVIDENCE PACK
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Request Payload Example:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(CONTEXT_COMPILER_CONTRACT.exampleRequest, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Evidence Pack Response:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(CONTEXT_COMPILER_CONTRACT.exampleResponse, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DEBUGGING API */}
          {activeSection === 'debugging_api' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">4. Debugging Agent Contract</h3>
                  <p className="text-slate-500 mt-0.5">
                    Endpoint: <code className="font-mono text-indigo-600 font-bold">POST /api/agents/debugging</code>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('dbg_curl', DEBUGGING_AGENT_CONTRACT.curlSnippet)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {copiedKey === 'dbg_curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Copy cURL</span>
                </button>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] space-y-1">
                <strong className="block font-bold">The Proposed Fix Invariant:</strong>
                <span>The Debugging Agent outputs <em>&ldquo;Proposed fix: ...&rdquo;</em> strategies. It is strictly prohibited from claiming that a fix has been verified or executed until Antigravity re-runs tests in the sandbox.</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Request Payload Example:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(DEBUGGING_AGENT_CONTRACT.exampleRequest, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Diagnosis & Proposed Fix Strategy Response:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(DEBUGGING_AGENT_CONTRACT.exampleResponse, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: ERROR HANDLING */}
          {activeSection === 'error_handling' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-slate-900">5. Standardized Error Handling</h3>
                <p className="text-slate-500 mt-0.5">
                  All error responses across all agents adhere to the frozen v1.0 error envelope.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Standard Error Envelope:</h4>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{`{
  "schema_version": "1.0",
  "agent": "work_item_understanding | context_compiler | debugging_agent",
  "status": "error",
  "result": null,
  "errors": [
    {
      "code": "MISSING_REQUIRED_FIELD",
      "message": "Field 'work_item.description' is required and cannot be empty.",
      "field": "work_item.description"
    }
  ]
}`}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Standardized Error Codes Catalog:</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                      <tr>
                        <th className="p-2.5">Error Code</th>
                        <th className="p-2.5">HTTP</th>
                        <th className="p-2.5">Trigger Condition & Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">MISSING_REQUIRED_FIELD</td>
                        <td className="p-2.5 text-slate-600">400</td>
                        <td className="p-2.5 font-sans text-slate-700">A mandatory input field (such as work_item.description) is missing or empty.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">MALFORMED_INPUT</td>
                        <td className="p-2.5 text-slate-600">400</td>
                        <td className="p-2.5 font-sans text-slate-700">Payload data types violate schema (e.g. repository_files is a string instead of array).</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">EMPTY_REPOSITORY_CONTEXT</td>
                        <td className="p-2.5 text-slate-600">400</td>
                        <td className="p-2.5 font-sans text-slate-700">Context Compiler was called with zero source files.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">INSUFFICIENT_EVIDENCE</td>
                        <td className="p-2.5 text-slate-600">400</td>
                        <td className="p-2.5 font-sans text-slate-700">Debugging Agent received zero stack traces, test outputs, build logs, or source code.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">CONTRADICTORY_REQUIREMENTS</td>
                        <td className="p-2.5 text-slate-600">200 / 422</td>
                        <td className="p-2.5 font-sans text-slate-700">Requirements are mutually exclusive (e.g. sub-50ms sync with 3000ms external sync). Escalation required.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-700">RATE_LIMIT_OR_UPSTREAM_ERROR</td>
                        <td className="p-2.5 text-slate-600">500 / 503</td>
                        <td className="p-2.5 font-sans text-slate-700">Underlying LLM service failure or quota exhaustion; handled gracefully by deterministic fallback.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: MANDATORY VS OPTIONAL FIELDS MATRIX */}
          {activeSection === 'fields_matrix' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-slate-900">6. Mandatory vs. Optional Fields Matrix</h3>
                <p className="text-slate-500 mt-0.5">
                  Reference matrix for Antigravity engineers constructing request payloads.
                </p>
              </div>

              <div className="space-y-4">
                {/* Agent 1 Fields */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Agent 1: Work Item Understanding</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Field Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        <tr>
                          <td className="p-2 font-mono font-bold text-slate-900">work_item.description</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-rose-600 font-mono">MANDATORY</td>
                          <td className="p-2 text-slate-700">Raw ticket description or specification text.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">work_item.id</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">Ticket identifier (e.g. AUTH-101).</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">work_item.title</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">Short summary title.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">system_context</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">High-level architecture or deployment notes.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Agent 2 Fields */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Agent 2: Context Compiler</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Field Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        <tr>
                          <td className="p-2 font-mono font-bold text-slate-900">work_item</td>
                          <td className="p-2 font-mono text-slate-600">string | object</td>
                          <td className="p-2 font-bold text-rose-600 font-mono">MANDATORY</td>
                          <td className="p-2 text-slate-700">Work item being contextualized.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono font-bold text-slate-900">repository_files</td>
                          <td className="p-2 font-mono text-slate-600">array</td>
                          <td className="p-2 font-bold text-rose-600 font-mono">MANDATORY</td>
                          <td className="p-2 text-slate-700">Non-empty list of &#123; path, content &#125; source files.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">agents_md</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">AGENTS.md active engineering rules.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">domain_documents</td>
                          <td className="p-2 font-mono text-slate-600">string | array</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">RFCs, API schemas, or protocol specifications.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">existing_tests</td>
                          <td className="p-2 font-mono text-slate-600">array</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">Existing test files related to the scope.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Agent 3 Fields */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Agent 3: Debugging Agent</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                        <tr>
                          <th className="p-2">Field Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        <tr>
                          <td className="p-2 font-mono font-bold text-slate-900">test_results OR stack_trace</td>
                          <td className="p-2 font-mono text-slate-600">string</td>
                          <td className="p-2 font-bold text-rose-600 font-mono">MANDATORY (1 of)</td>
                          <td className="p-2 text-slate-700">At least one telemetry artifact from failing sandbox execution.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">changed_files</td>
                          <td className="p-2 font-mono text-slate-600">array</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">Git diff or modified file contents.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">relevant_source_code</td>
                          <td className="p-2 font-mono text-slate-600">array</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">Surrounding source code files.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono text-slate-900">previous_debugging_attempts</td>
                          <td className="p-2 font-mono text-slate-600">string[]</td>
                          <td className="p-2 font-bold text-slate-500 font-mono">OPTIONAL</td>
                          <td className="p-2 text-slate-700">List of failed attempts to avoid cycling.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: WHAT AI STUDIO DOES NOT VERIFY */}
          {activeSection === 'boundary_guarantees' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-slate-900">7. What AI Studio DOES NOT Verify</h3>
                <p className="text-slate-500 mt-0.5">
                  The boundary guarantee protecting autonomous integrity.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Zero Code Execution Guarantee</span>
                  </h4>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                    AI Studio never executes your application code, never compiles binaries, and never runs test runners. All reasoning is static cognitive analysis based on supplied text. Antigravity&rsquo;s isolated sandbox is the sole environment where code is executed and tested.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Zero Git / VCS Mutation Guarantee</span>
                  </h4>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                    AI Studio does not possess GitHub tokens, SSH keys, or Git worktree access. It does not commit code, create branches, push tags, or open pull requests. All repository persistence is controlled by Antigravity.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>No False Verification Claims</span>
                  </h4>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                    When the Debugging Agent returns a fix strategy, it is labeled as a <em>&ldquo;Proposed fix&rdquo;</em>. Antigravity must apply the patch, execute the test suite in a clean sandbox container, and verify green status before marking the issue resolved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
