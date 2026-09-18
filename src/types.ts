export interface EvaluationCase {
  id: string;
  categoryNumber: number;
  categoryName: string;
  title: string;
  targetAgent: 'work-item' | 'context-compiler' | 'debugging';
  inputData: any;
  expectedBehavior: {
    description: string;
    mustContain: string[];
    mustNotInvent: string[];
    shouldEscalate: boolean;
    expectedRootCauseKeywords?: string[];
  };
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  executionNote: string;
  structuredOutputValidity: boolean;
  requirementExtractionAccuracy: string;
  evidenceGroundingScore: string;
  rootCauseAccuracy: string;
  hallucinationsDetected: string[];
  missingInformation: string[];
  modelOutput: any;
}

export type EpistemicCategory = 'FACT' | 'INFERENCE' | 'ASSUMPTION' | 'UNKNOWN';

export interface ReasoningError {
  code:
    | 'MALFORMED_INPUT'
    | 'MISSING_REQUIRED_FIELD'
    | 'EMPTY_REPOSITORY_CONTEXT'
    | 'INSUFFICIENT_EVIDENCE'
    | 'INVALID_JSON'
    | 'CONTRADICTORY_REQUIREMENTS'
    | 'UNSUPPORTED_INPUT'
    | 'MODEL_UNCERTAINTY'
    | 'IMPOSSIBLE_DIAGNOSIS'
    | 'RATE_LIMIT_OR_UPSTREAM_ERROR';
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ReasoningResponse<T> {
  schema_version: '1.0';
  agent: 'work_item_understanding' | 'context_compiler' | 'debugging_agent';
  status: 'success' | 'error';
  result: T | null;
  errors: ReasoningError[];
  _source?: 'gemini-3.8-flash' | 'deterministic-engine' | 'deterministic-fallback';
}

// -------------------------------------------------------------
// AGENT 1: Work Item Understanding Contract
// -------------------------------------------------------------
export interface WorkItemInputPayload {
  work_item: {
    id?: string;
    title?: string;
    description: string;
    source?: 'jira' | 'linear' | 'manual';
  };
  system_context?: string;
}

export interface WorkItemUnderstandingResult {
  summary: string;
  requirements: string[];
  acceptance_criteria: string[];
  constraints: string[];
  dependencies: string[];
  affected_components: string[];
  ambiguities: string[];
  assumptions: string[];
  missing_information: string[];
  implementation_considerations: string[];
  required_tests: string[];
  epistemic_classification: {
    facts: string[];
    inferences: string[];
    assumptions: string[];
    unknowns: string[];
  };
  human_escalation: {
    required: boolean;
    reason: string;
  };
  confidence: number;
  // Compatibility fields
  human_investigation_required?: boolean;
  reason_for_escalation?: string;
}

export type WorkItemUnderstandingOutput = ReasoningResponse<WorkItemUnderstandingResult>;

// -------------------------------------------------------------
// AGENT 2: Context Compiler Contract
// -------------------------------------------------------------
export interface RepositoryFile {
  path: string;
  content: string;
}

export interface ContextCompilerInputPayload {
  work_item: string | { id?: string; title?: string; description: string };
  repository_files: RepositoryFile[];
  readme?: string;
  agents_md?: string;
  contributing_md?: string;
  architecture_documents?: string | string[];
  domain_documents?: string | string[];
  existing_tests?: RepositoryFile[];
  previous_implementation_context?: string;
}

export interface RelevantFile {
  path: string;
  relevance_score: number;
  reason: string;
  relevant_sections: string[];
}

export interface ContextEvidence {
  source: string;
  claim: string;
  supporting_excerpt: string;
  confidence: number;
  evidence_type: EpistemicCategory;
  // Compatibility
  category?: EpistemicCategory;
}

export interface ContextCompilerResult {
  task_summary: string;
  relevant_files: RelevantFile[];
  repository_rules: string[];
  existing_patterns: string[];
  relevant_tests: string[];
  domain_context: string[];
  implementation_constraints: string[];
  missing_context: string[];
  evidence: ContextEvidence[];
  evidence_pack_summary: string;
  human_escalation: {
    required: boolean;
    reason: string;
  };
  confidence: number;
  // Compatibility
  human_investigation_required?: boolean;
  reason_for_escalation?: string;
}

export type ContextCompilerOutput = ReasoningResponse<ContextCompilerResult>;

// -------------------------------------------------------------
// AGENT 3: Debugging Agent Contract
// -------------------------------------------------------------
export interface ChangedFile {
  path: string;
  diffOrContent?: string;
  diff?: string;
}

export interface DebuggingAgentInputPayload {
  work_item?: string | { id?: string; title?: string; description: string };
  changed_files?: ChangedFile[];
  git_diff?: string;
  test_results?: string;
  build_results?: string;
  lint_results?: string;
  typecheck_results?: string;
  stack_trace?: string;
  logs?: string;
  relevant_source_code?: RepositoryFile[];
  repository_rules?: string;
  previous_debugging_attempts?: string[];
}

export interface DebugEvidence {
  source: string;
  observation: string;
  supports_root_cause: boolean;
  evidence_type: EpistemicCategory;
  category?: EpistemicCategory;
}

export interface DebuggingAgentResult {
  failure_classification: string;
  symptom: string;
  root_cause: string;
  evidence: DebugEvidence[];
  alternative_hypotheses: string[];
  affected_files: string[];
  fix_strategy: string[]; // Minimal surgical proposed fix
  regression_tests: string[];
  confidence: number;
  human_investigation_required: boolean;
  reason_for_escalation: string;
  human_escalation: {
    required: boolean;
    reason: string;
  };
}

export type DebuggingAgentOutput = ReasoningResponse<DebuggingAgentResult>;

// -------------------------------------------------------------
// Adversarial Evaluation & Test Mode
// -------------------------------------------------------------
export interface AdversarialTestCase {
  id: string;
  caseNumber: number;
  name: string;
  description: string;
  targetAgent: 'work_item_understanding' | 'context_compiler' | 'debugging_agent';
  inputPayload: any;
  adversarialType:
    | 'missing_requirements'
    | 'contradictory_requirements'
    | 'vague_requirements'
    | 'fake_repository_files'
    | 'irrelevant_repository_files'
    | 'missing_documentation'
    | 'conflicting_agents_md_rules'
    | 'incomplete_stack_traces'
    | 'multiple_plausible_root_causes'
    | 'no_evidence_for_diagnosis'
    | 'previous_attempt_already_failed'
    | 'security_sensitive_change'
    | 'incorrect_model_assumption'
    | 'empty_input'
    | 'malformed_json';
  expectedBehavior: {
    shouldEscalate: boolean;
    expectedErrorCode?: string;
    mustContainInResult?: string[];
    mustNotInventKeywords?: string[];
    requiredEpistemicCheck?: string;
  };
}

export interface AdversarialEvaluationResult {
  testId: string;
  caseNumber: number;
  name: string;
  targetAgent: string;
  passed: boolean;
  score: number;
  reason: string;
  hallucinationDetected: boolean;
  hallucinationDetails: string[];
  schemaViolation: boolean;
  schemaViolationDetails: string[];
  unsupportedInference: boolean;
  unsupportedInferenceDetails: string[];
  escalationCorrectness: boolean;
  escalationDetails: string;
  rawResponse: any;
}
