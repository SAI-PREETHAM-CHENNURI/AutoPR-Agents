/**
 * ANTIGRAVITY & AUTO PR REASONING ENGINE - FROZEN API CONTRACTS v1.0
 * 
 * Boundary Definition:
 * GOOGLE AI STUDIO = AI REASONING + STRUCTURED OUTPUTS
 * ANTIGRAVITY = ORCHESTRATION + CODE EXECUTION + SANDBOX + VALIDATION + GIT + PR
 */

export interface ContractSpec {
  name: string;
  agentId: string;
  endpoint: string;
  method: string;
  description: string;
  requiredFields: { name: string; type: string; description: string }[];
  optionalFields: { name: string; type: string; description: string }[];
  validationRules: string[];
  inputSchema: any;
  outputSchema: any;
  errorSchema: any;
  exampleRequest: any;
  exampleResponse: any;
  exampleError: any;
  typeScriptSnippet: string;
  curlSnippet: string;
}

export const WORK_ITEM_UNDERSTANDING_CONTRACT: ContractSpec = {
  name: 'Work Item Understanding Agent',
  agentId: 'work_item_understanding',
  endpoint: '/api/agents/work-item-understanding',
  method: 'POST',
  description: 'Ingests raw Jira/Linear-style tickets, separates FACT from INFERENCE/ASSUMPTION, outputs testable acceptance criteria, and triggers human escalation if requirements conflict or critical details are missing.',
  requiredFields: [
    { name: 'work_item.description', type: 'string', description: 'Raw ticket or specification text. Minimum 5 characters.' }
  ],
  optionalFields: [
    { name: 'work_item.id', type: 'string', description: 'Jira or Linear ticket ID (e.g. AUTH-402).' },
    { name: 'work_item.title', type: 'string', description: 'Work item title.' },
    { name: 'work_item.source', type: 'string (jira | linear | manual)', description: 'Origin system.' },
    { name: 'system_context', type: 'string', description: 'High-level architecture or deployment notes.' }
  ],
  validationRules: [
    'work_item object or workItem string must be provided.',
    'Description cannot be empty or whitespace only.',
    'Zero unrequested requirements may be hallucinated or invented.',
    'Acceptance criteria must be empirically verifiable via unit or integration tests.',
    'If requirements contradict (e.g. sub-50ms sync execution with 3000ms external call), human_escalation.required MUST be true.'
  ],
  inputSchema: {
    type: 'object',
    required: ['work_item'],
    properties: {
      work_item: {
        type: 'object',
        required: ['description'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          source: { type: 'string', enum: ['jira', 'linear', 'manual'] }
        }
      },
      system_context: { type: 'string' }
    }
  },
  outputSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['work_item_understanding'] },
      status: { type: 'string', enum: ['success', 'error'] },
      result: {
        type: 'object',
        required: [
          'summary',
          'requirements',
          'acceptance_criteria',
          'constraints',
          'dependencies',
          'affected_components',
          'ambiguities',
          'assumptions',
          'missing_information',
          'implementation_considerations',
          'required_tests',
          'epistemic_classification',
          'human_escalation',
          'confidence'
        ]
      },
      errors: { type: 'array' }
    }
  },
  errorSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['work_item_understanding'] },
      status: { type: 'string', enum: ['error'] },
      result: { type: 'null' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            field: { type: 'string' }
          }
        }
      }
    }
  },
  exampleRequest: {
    work_item: {
      id: 'API-102',
      title: 'Add pagination to /users API',
      description: 'Add pagination to the /users API. The default page size should be 20 and clients should be able to specify a page number. Return total item count.',
      source: 'jira'
    },
    system_context: 'FastAPI service with PostgreSQL backend.'
  },
  exampleResponse: {
    schema_version: '1.0',
    agent: 'work_item_understanding',
    status: 'success',
    result: {
      summary: 'Add page-number and limit pagination with total count to /users API.',
      requirements: [
        'Expose page parameter for client page number specification',
        'Set default page size limit to 20 users',
        'Include total user count in response envelope'
      ],
      acceptance_criteria: [
        'GET /users without query params returns first 20 records and total_count',
        'GET /users?page=2 returns records 21-40',
        'GET /users?page=-1 returns HTTP 422 Unprocessable Entity'
      ],
      constraints: ['Must preserve backward compatibility for clients expecting array or envelope'],
      dependencies: ['PostgreSQL users table query layer'],
      affected_components: ['routes/users.py', 'schemas/pagination.py'],
      ambiguities: ['Response structure (envelope vs Link headers) not specified'],
      assumptions: ['Clients accept JSON response wrapper { items: [...], total_count: N }'],
      missing_information: ['Maximum permissible page size (max_limit cap)'],
      implementation_considerations: ['COUNT(*) performance on large tables; consider indexed pagination'],
      required_tests: [
        'test_default_page_size_20',
        'test_page_offset_boundary',
        'test_invalid_page_number_422'
      ],
      epistemic_classification: {
        facts: ['Default page size is 20', 'Clients can specify page number', 'Total count required'],
        inferences: ['Users query must execute LIMIT and OFFSET with COUNT'],
        assumptions: ['1-based indexing for page number'],
        unknowns: ['Max limit cap', 'Sort order default']
      },
      human_escalation: {
        required: false,
        reason: ''
      },
      confidence: 0.94
    },
    errors: []
  },
  exampleError: {
    schema_version: '1.0',
    agent: 'work_item_understanding',
    status: 'error',
    result: null,
    errors: [
      {
        code: 'MISSING_REQUIRED_FIELD',
        message: 'Field "work_item.description" is required and cannot be empty.',
        field: 'work_item.description'
      }
    ]
  },
  typeScriptSnippet: `import { WorkItemInputPayload, WorkItemUnderstandingOutput } from '@auto-pr/types';

export async function analyzeWorkItem(
  payload: WorkItemInputPayload
): Promise<WorkItemUnderstandingOutput> {
  const res = await fetch('https://reasoning.auto-pr.internal/api/agents/work-item-understanding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}`,
  curlSnippet: `curl -X POST https://reasoning.auto-pr.internal/api/agents/work-item-understanding \\
  -H "Content-Type: application/json" \\
  -d '{
    "work_item": {
      "id": "API-102",
      "title": "Add pagination to /users API",
      "description": "Add pagination to /users. Default page size 20.",
      "source": "jira"
    }
  }'`
};

export const CONTEXT_COMPILER_CONTRACT: ContractSpec = {
  name: 'Context Compiler Agent',
  agentId: 'context_compiler',
  endpoint: '/api/agents/context-compiler',
  method: 'POST',
  description: 'Converts raw work item + repository files + repository rules (AGENTS.md) + domain docs into a compact, ranked Evidence Pack. Never fabricates repository files.',
  requiredFields: [
    { name: 'work_item', type: 'string | object', description: 'Specification of the task to contextualize.' },
    { name: 'repository_files', type: 'array of { path: string, content: string }', description: 'Discovered source files from repo.' }
  ],
  optionalFields: [
    { name: 'agents_md / repository_rules', type: 'string', description: 'Active engineering rules (e.g. AGENTS.md).' },
    { name: 'readme', type: 'string', description: 'Project overview README.' },
    { name: 'contributing_md', type: 'string', description: 'Developer workflow guide.' },
    { name: 'domain_documents', type: 'string | string[]', description: 'RFCs, protocol specs, or data schemas.' },
    { name: 'existing_tests', type: 'array of { path: string, content: string }', description: 'Unit or integration test files.' },
    { name: 'previous_implementation_context', type: 'string', description: 'Context from prior steps.' }
  ],
  validationRules: [
    'repository_files must be an array.',
    'Files must not be fabricated; claims must trace back to supplied file content.',
    'Relevance score must be a number between 0.0 and 1.0.',
    'Every evidence item must specify evidence_type as FACT, INFERENCE, ASSUMPTION, or UNKNOWN.',
    'If critical repository files are missing, missing_context must be populated and human_escalation triggered if severe.'
  ],
  inputSchema: {
    type: 'object',
    required: ['work_item', 'repository_files'],
    properties: {
      work_item: { type: ['string', 'object'] },
      repository_files: {
        type: 'array',
        items: {
          type: 'object',
          required: ['path', 'content'],
          properties: {
            path: { type: 'string' },
            content: { type: 'string' }
          }
        }
      },
      agents_md: { type: 'string' },
      domain_documents: { type: ['string', 'array'] },
      existing_tests: { type: 'array' }
    }
  },
  outputSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['context_compiler'] },
      status: { type: 'string', enum: ['success', 'error'] },
      result: {
        type: 'object',
        required: [
          'task_summary',
          'relevant_files',
          'repository_rules',
          'existing_patterns',
          'relevant_tests',
          'domain_context',
          'implementation_constraints',
          'missing_context',
          'evidence',
          'evidence_pack_summary',
          'human_escalation',
          'confidence'
        ]
      },
      errors: { type: 'array' }
    }
  },
  errorSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['context_compiler'] },
      status: { type: 'string', enum: ['error'] },
      result: { type: 'null' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          required: ['code', 'message']
        }
      }
    }
  },
  exampleRequest: {
    work_item: 'Add token expiration verification to auth/token_service.py using RFC 7519 NumericDate format. Reject expired tokens with 401.',
    repository_files: [
      {
        path: 'auth/token_service.py',
        content: 'class TokenService:\n    def verify_token(self, token_str):\n        payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])\n        return payload'
      }
    ],
    agents_md: 'AGENTS.md: Always use timezone-aware datetime.now(timezone.utc). Never use datetime.utcnow().',
    domain_documents: 'RFC 7519 Section 4.1.4: "exp" identifies the expiration time. Token MUST be rejected if current time >= exp.'
  },
  exampleResponse: {
    schema_version: '1.0',
    agent: 'context_compiler',
    status: 'success',
    result: {
      task_summary: 'Enforce expiration claim validation in auth/token_service.py per RFC 7519 and UTC repository rule.',
      relevant_files: [
        {
          path: 'auth/token_service.py',
          relevance_score: 0.98,
          reason: 'Contains verify_token method which currently lacks expiration inspection.',
          relevant_sections: ['TokenService.verify_token']
        }
      ],
      repository_rules: [
        'AGENTS.md: Always use timezone-aware datetime.now(timezone.utc).'
      ],
      existing_patterns: [
        'PyJWT decode pattern with algorithms=["HS256"]'
      ],
      relevant_tests: ['tests/test_token_service.py'],
      domain_context: ['RFC 7519 exp NumericDate UTC epoch comparison'],
      implementation_constraints: [
        'Must raise TokenExpiredError or return HTTP 401',
        'Must compare against timezone.utc timestamp'
      ],
      missing_context: [],
      evidence: [
        {
          source: 'auth/token_service.py line 4',
          claim: 'verify_token decodes token without exp expiration validation',
          supporting_excerpt: 'payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])',
          confidence: 0.98,
          evidence_type: 'FACT'
        }
      ],
      evidence_pack_summary: 'Implement exp validation in TokenService.verify_token using datetime.now(timezone.utc).timestamp().',
      human_escalation: {
        required: false,
        reason: ''
      },
      confidence: 0.96
    },
    errors: []
  },
  exampleError: {
    schema_version: '1.0',
    agent: 'context_compiler',
    status: 'error',
    result: null,
    errors: [
      {
        code: 'EMPTY_REPOSITORY_CONTEXT',
        message: 'No repository files supplied. Context Compiler requires at least one source file to compile evidence.'
      }
    ]
  },
  typeScriptSnippet: `import { ContextCompilerInputPayload, ContextCompilerOutput } from '@auto-pr/types';

export async function compileContext(
  payload: ContextCompilerInputPayload
): Promise<ContextCompilerOutput> {
  const res = await fetch('https://reasoning.auto-pr.internal/api/agents/context-compiler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}`,
  curlSnippet: `curl -X POST https://reasoning.auto-pr.internal/api/agents/context-compiler \\
  -H "Content-Type: application/json" \\
  -d '{
    "work_item": "Enforce token expiration",
    "repository_files": [{"path": "auth/token.py", "content": "class Token: pass"}]
  }'`
};

export const DEBUGGING_AGENT_CONTRACT: ContractSpec = {
  name: 'Debugging Agent',
  agentId: 'debugging_agent',
  endpoint: '/api/agents/debugging',
  method: 'POST',
  description: 'Analyzes real validation failures (test assertions, stack traces, build logs) from Antigravity sandboxes. Isolates root cause, forms alternative hypotheses, and proposes minimal surgical fixes without claiming execution verification.',
  requiredFields: [
    { name: 'test_results OR stack_trace OR build_results', type: 'string', description: 'Execution failure output from the sandbox.' }
  ],
  optionalFields: [
    { name: 'work_item', type: 'string | object', description: 'Target work item.' },
    { name: 'changed_files', type: 'array of { path: string, diff: string }', description: 'Recent git diff or changed files.' },
    { name: 'relevant_source_code', type: 'array of { path: string, content: string }', description: 'Source code in scope.' },
    { name: 'repository_rules', type: 'string', description: 'AGENTS.md guidelines.' },
    { name: 'previous_debugging_attempts', type: 'string[]', description: 'History of failed debugging tries to prevent repetition.' }
  ],
  validationRules: [
    'The Debugging Agent MUST NOT claim that a proposed fix works or has been executed. It can only state "proposed fix".',
    'Separates observed evidence (FACT) from inference (INFERENCE).',
    'Fix strategy must be minimal and surgical (no broad unrequested refactoring).',
    'If telemetry is truncated or insufficient, MUST set human_investigation_required = true with error code INSUFFICIENT_EVIDENCE.'
  ],
  inputSchema: {
    type: 'object',
    properties: {
      work_item: { type: ['string', 'object'] },
      test_results: { type: 'string' },
      stack_trace: { type: 'string' },
      changed_files: { type: 'array' },
      relevant_source_code: { type: 'array' },
      previous_debugging_attempts: { type: 'array' }
    }
  },
  outputSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['debugging_agent'] },
      status: { type: 'string', enum: ['success', 'error'] },
      result: {
        type: 'object',
        required: [
          'failure_classification',
          'symptom',
          'root_cause',
          'evidence',
          'alternative_hypotheses',
          'affected_files',
          'fix_strategy',
          'regression_tests',
          'confidence',
          'human_investigation_required',
          'reason_for_escalation',
          'human_escalation'
        ]
      },
      errors: { type: 'array' }
    }
  },
  errorSchema: {
    type: 'object',
    required: ['schema_version', 'agent', 'status', 'result', 'errors'],
    properties: {
      schema_version: { type: 'string', enum: ['1.0'] },
      agent: { type: 'string', enum: ['debugging_agent'] },
      status: { type: 'string', enum: ['error'] },
      result: { type: 'null' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          required: ['code', 'message']
        }
      }
    }
  },
  exampleRequest: {
    work_item: 'Reject expired password reset tokens',
    test_results: 'FAIL: test_password_reset_expired_token\nAssertionError: Expected 401, got 200.',
    stack_trace: 'auth/password_reset.py:18 in reset_password\n  assert status == 401\nAssertionError: 200 != 401',
    changed_files: [
      {
        path: 'auth/password_reset.py',
        diff: '+ if now < token.expires_at:\n+     return 401'
      }
    ],
    relevant_source_code: [
      {
        path: 'auth/password_reset.py',
        content: 'def reset_password(token):\n    now = time.time()\n    if now < token.expires_at:\n        return 401\n    return 200'
      }
    ]
  },
  exampleResponse: {
    schema_version: '1.0',
    agent: 'debugging_agent',
    status: 'success',
    result: {
      failure_classification: 'AssertionFailure: InvertedComparisonOperator',
      symptom: 'test_password_reset_expired_token expected HTTP 401, received HTTP 200 OK.',
      root_cause: 'Comparison operator in auth/password_reset.py is inverted: checks "now < token.expires_at" instead of "now > token.expires_at" or "now >= token.expires_at".',
      evidence: [
        {
          source: 'auth/password_reset.py line 3',
          observation: 'if now < token.expires_at: return 401 rejects VALID tokens and allows expired tokens.',
          supports_root_cause: true,
          evidence_type: 'FACT'
        }
      ],
      alternative_hypotheses: [
        'Timezone skew between token.expires_at generator and time.time()'
      ],
      affected_files: ['auth/password_reset.py'],
      fix_strategy: [
        'Proposed fix: Change condition from "if now < token.expires_at" to "if now >= token.expires_at:" in auth/password_reset.py.'
      ],
      regression_tests: [
        'test_password_reset_rejects_expired_token_with_401',
        'test_password_reset_accepts_valid_unexpired_token_with_200'
      ],
      confidence: 0.98,
      human_investigation_required: false,
      reason_for_escalation: '',
      human_escalation: {
        required: false,
        reason: ''
      }
    },
    errors: []
  },
  exampleError: {
    schema_version: '1.0',
    agent: 'debugging_agent',
    status: 'error',
    result: null,
    errors: [
      {
        code: 'INSUFFICIENT_EVIDENCE',
        message: 'Available telemetry and stack trace are truncated or empty; unable to diagnose reliable root cause.'
      }
    ]
  },
  typeScriptSnippet: `import { DebuggingAgentInputPayload, DebuggingAgentOutput } from '@auto-pr/types';

export async function diagnoseFailure(
  payload: DebuggingAgentInputPayload
): Promise<DebuggingAgentOutput> {
  const res = await fetch('https://reasoning.auto-pr.internal/api/agents/debugging', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}`,
  curlSnippet: `curl -X POST https://reasoning.auto-pr.internal/api/agents/debugging \\
  -H "Content-Type: application/json" \\
  -d '{
    "test_results": "FAIL: test_token Expected 401 got 200",
    "stack_trace": "AssertionError 200 != 401"
  }'`
};
