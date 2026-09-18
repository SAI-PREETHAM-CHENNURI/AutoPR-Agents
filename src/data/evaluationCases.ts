import { EvaluationCase } from '../types';

export const EVALUATION_CASES: EvaluationCase[] = [
  {
    id: 'case-1-simple-feature',
    categoryNumber: 1,
    categoryName: 'Simple feature request',
    title: 'Add pagination to /users API',
    targetAgent: 'work-item',
    inputData: {
      workItem: 'Add pagination to the /users API. The default page size should be 20 and clients should be able to specify a page number.'
    },
    expectedBehavior: {
      description: 'Identify pagination requirement, default page size (20), endpoint (/users), client page number parameter. Generate testable acceptance criteria. Do NOT invent maximum page size or response envelope schema.',
      mustContain: ['/users', '20', 'page', 'pagination'],
      mustNotInvent: ['maximum page size of 100', 'cursor pagination', 'sort order', 'page_size parameter'],
      shouldEscalate: false
    }
  },
  {
    id: 'case-2-ambiguous-feature',
    categoryNumber: 2,
    categoryName: 'Ambiguous feature request',
    title: 'Make the application faster',
    targetAgent: 'work-item',
    inputData: {
      workItem: 'Make the application faster. Several users mentioned that screens take too long to load.'
    },
    expectedBehavior: {
      description: 'Must flag high ambiguity. Must state that measurable performance metrics (p95/p99 latency, specific screens, network conditions) are missing. Must NOT invent an arbitrary SLA target like "reduce latency by 50%". Should recommend human clarification.',
      mustContain: ['ambiguity', 'metrics', 'missing'],
      mustNotInvent: ['reduce latency by 50%', 'target 200ms', 'cache with Redis', 'upgrade CPU'],
      shouldEscalate: true
    }
  },
  {
    id: 'case-3-bug-report',
    categoryNumber: 3,
    categoryName: 'Bug report',
    title: 'Checkout sometimes returns HTTP 500',
    targetAgent: 'debugging',
    inputData: {
      workItem: 'BUG-402: Checkout endpoint sporadically returns HTTP 500 for users during checkout flow.',
      testOutput: 'Test suite: 42 passed, 0 failed in local run.',
      stackTrace: 'Traceback (most recent call last):\n  File "services/checkout.py", line 118, in process_order\n    payment_res = gateway.charge(amount, currency, idempotency_key)\n  File "integrations/payment.py", line 45, in charge\n    raise TimeoutError("Payment provider socket read timed out after 5000ms")',
      sourceCode: [
        {
          path: 'services/checkout.py',
          content: 'def process_order(cart, user, idempotency_key):\n    # Calculates total\n    amount = cart.compute_total()\n    # Call external gateway without try/except or circuit breaker\n    payment_res = gateway.charge(amount, cart.currency, idempotency_key)\n    return order_repo.save(payment_res)'
        },
        {
          path: 'integrations/payment.py',
          content: 'def charge(amount, currency, key):\n    # 5s socket timeout\n    return http_client.post("/v1/charges", timeout=5.0, data={"amount": amount, "currency": currency})'
        }
      ],
      changedFiles: []
    },
    expectedBehavior: {
      description: 'Do not declare a single root cause without inspecting logs. Identify unhandled socket timeout from external payment gateway as primary symptom. Formulate alternative hypotheses (gateway outage, low timeout threshold, network blip). Propose resilient retry/timeout handling and error mapping (e.g. 504/502).',
      mustContain: ['TimeoutError', 'payment', 'gateway', 'timeout'],
      mustNotInvent: ['database lock contention', 'SQL injection', 'memory leak'],
      shouldEscalate: false,
      expectedRootCauseKeywords: ['timeout', 'unhandled exception', 'gateway']
    }
  },
  {
    id: 'case-4-existing-code-modification',
    categoryNumber: 4,
    categoryName: 'Existing-code modification',
    title: 'Update auth token expiration handling in auth/token_service.py',
    targetAgent: 'context-compiler',
    inputData: {
      workItem: 'Update auth token verification to check explicit expiration timestamp against UTC clock and reject expired tokens with TokenExpiredError.',
      repositoryFiles: [
        {
          path: 'auth/token_service.py',
          content: 'class TokenService:\n    def verify_token(self, token_str):\n        payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])\n        # Currently only checks signature, no exp check\n        return payload["sub"]'
        },
        {
          path: 'services/user_service.py',
          content: 'class UserService:\n    def get_profile(self, user_id):\n        return db.users.find(user_id)'
        }
      ],
      repositoryRules: 'AGENTS.md: Always use timezone-aware datetime.now(timezone.utc). Never use datetime.utcnow() which is deprecated.',
      domainDocumentation: 'Auth architecture doc: Tokens use standard RFC 7519 "exp" claim representing seconds since Unix epoch.',
      testFiles: [
        {
          path: 'tests/test_token_service.py',
          content: 'def test_verify_valid_token():\n    assert token_svc.verify_token(valid_token) == "user_123"'
        }
      ]
    },
    expectedBehavior: {
      description: 'Identify auth/token_service.py as highest relevance. Note rule about timezone-aware datetime.now(timezone.utc). Note existing pattern in verify_token. Identify tests/test_token_service.py as relevant. Identify needed regression tests for expired tokens.',
      mustContain: ['auth/token_service.py', 'timezone.utc', 'exp'],
      mustNotInvent: ['OAuth2 refresh grant', 'Redis token blacklist'],
      shouldEscalate: false
    }
  },
  {
    id: 'case-5-conflicting-requirements',
    categoryNumber: 5,
    categoryName: 'Conflicting requirements',
    title: 'Strict backward compatibility vs mandatory schema expansion',
    targetAgent: 'work-item',
    inputData: {
      workItem: 'Update the Webhook payload serializer. The payload MUST remain byte-for-byte backward compatible with v1 consumers and cannot exceed 128 bytes. Also, add 6 new mandatory user identity and organization telemetry fields (totaling ~250 bytes) into the root JSON object.'
    },
    expectedBehavior: {
      description: 'Must explicitly flag the conflict: Cannot remain under 128 bytes / byte-for-byte backward compatible while simultaneously adding 250 bytes of mandatory new fields. Must flag ambiguity/conflict and require human resolution.',
      mustContain: ['conflict', 'contradictory', 'backward compatible', '128 bytes'],
      mustNotInvent: ['compression algorithm', 'protobuf migration'],
      shouldEscalate: true
    }
  },
  {
    id: 'case-6-missing-documentation',
    categoryNumber: 6,
    categoryName: 'Missing documentation',
    title: 'Migrate invoices to Internal Billing Gateway v3',
    targetAgent: 'context-compiler',
    inputData: {
      workItem: 'Migrate invoice creation to call the new Internal Billing Gateway v3 service at billing-internal.corp.',
      repositoryFiles: [
        {
          path: 'billing/client.py',
          content: '# Connects to v2 endpoint\nV2_ENDPOINT = "https://billing-v2.internal/api"\ndef create_invoice(data):\n    return http.post(V2_ENDPOINT, json=data)'
        }
      ],
      repositoryRules: 'CONTRIBUTING.md: All external services must have typed API schemas in /contracts.',
      domainDocumentation: 'No documentation provided for Billing Gateway v3 contracts, endpoints, or auth headers.',
      testFiles: []
    },
    expectedBehavior: {
      description: 'Context compiler must flag missing_context: No documentation, schema, or endpoint contract exists for v3. Must not invent v3 request/response schema or auth mechanism. Mark as UNKNOWN and escalate.',
      mustContain: ['missing', 'schema', 'v3'],
      mustNotInvent: ['https://billing-v3.internal/v3/invoices', 'Bearer token format', 'v3 payload structure'],
      shouldEscalate: true
    }
  },
  {
    id: 'case-7-obvious-test-failure',
    categoryNumber: 7,
    categoryName: 'Test failure with obvious root cause',
    title: 'Off-by-one index error in array slice',
    targetAgent: 'debugging',
    inputData: {
      workItem: 'Return the top 5 trending tags.',
      testOutput: 'FAIL: test_get_top_5_tags\nAssertionError: Expected length 5, but got 4.\nExpected: ["ai", "python", "react", "cloud", "dev"]\nActual: ["ai", "python", "react", "cloud"]',
      stackTrace: 'AssertionError: assert len(result) == 5\n  where 4 == 5',
      sourceCode: [
        {
          path: 'services/tags.py',
          content: 'def get_top_tags(tags, limit=5):\n    # Bug: slice uses limit - 1\n    return tags[:limit - 1]'
        }
      ],
      changedFiles: [
        {
          path: 'services/tags.py',
          diffOrContent: '- return tags[:limit]\n+ return tags[:limit - 1]'
        }
      ]
    },
    expectedBehavior: {
      description: 'Identify obvious root cause: `tags[:limit - 1]` slices 4 items instead of 5. Smallest reasonable fix is changing slice to `tags[:limit]`. High confidence. No human escalation needed.',
      mustContain: ['limit - 1', 'off-by-one', 'slice', 'tags[:limit]'],
      mustNotInvent: ['database sorting issue', 'database query failure'],
      shouldEscalate: false,
      expectedRootCauseKeywords: ['slice', 'limit - 1', 'off-by-one']
    }
  },
  {
    id: 'case-8-multiple-root-causes',
    categoryNumber: 8,
    categoryName: 'Test failure with multiple possible root causes',
    title: 'Intermittent failure in test_concurrent_transfers',
    targetAgent: 'debugging',
    inputData: {
      workItem: 'Handle high-throughput wallet transfers.',
      testOutput: 'FAIL: test_concurrent_transfers\nAssertionError: Balance mismatch: Expected 1000, got 1050 (run 3 of 10 failed intermittently)',
      stackTrace: 'Traceback (most recent call last):\n  File "tests/test_wallet.py", line 82, in test_concurrent_transfers\n    assert final_balance == expected_balance',
      sourceCode: [
        {
          path: 'wallet/service.py',
          content: 'def transfer(from_id, to_id, amount):\n    b1 = db.query("SELECT balance FROM wallets WHERE id = %s", from_id)\n    b2 = db.query("SELECT balance FROM wallets WHERE id = %s", to_id)\n    # Non-atomic read-then-write without SELECT FOR UPDATE or transaction\n    db.execute("UPDATE wallets SET balance = %s WHERE id = %s", (b1 - amount, from_id))\n    db.execute("UPDATE wallets SET balance = %s WHERE id = %s", (b2 + amount, to_id))'
        }
      ]
    },
    expectedBehavior: {
      description: 'Must identify multiple plausible hypotheses: 1. Race condition / non-atomic read-modify-write without row locks or transactions. 2. Isolation level defaults allowing dirty/lost updates. Rank hypotheses by evidence strength. Do not guess a single cause without noting concurrency hazards.',
      mustContain: ['race condition', 'concurrency', 'atomic', 'lock'],
      mustNotInvent: ['floating point rounding error', 'network latency timeout'],
      shouldEscalate: false,
      expectedRootCauseKeywords: ['race condition', 'atomicity', 'transaction', 'lock']
    }
  },
  {
    id: 'case-9-repo-rule-conflict',
    categoryNumber: 9,
    categoryName: 'Repository-rule conflict',
    title: 'Feature implementation violates forbidden direct DB query rule',
    targetAgent: 'context-compiler',
    inputData: {
      workItem: 'Add a summary widget to the dashboard controller displaying total active users.',
      repositoryFiles: [
        {
          path: 'controllers/dashboard_controller.ts',
          content: 'export class DashboardController {\n  async getSummary() {\n    // Implementation draft\n  }\n}'
        },
        {
          path: 'services/user_service.ts',
          content: 'export class UserService {\n  async countActiveUsers(): Promise<number> {\n    return this.userRepo.count({ status: "active" });\n  }\n}'
        }
      ],
      repositoryRules: 'AGENTS.md RULE #4: Controllers MUST NEVER import database pools, write raw SQL queries, or bypass the Domain Service layer. All business queries must go through existing Domain Services.',
      domainDocumentation: 'Architecture: Controllers -> Domain Services -> Repositories -> Database.',
      testFiles: []
    },
    expectedBehavior: {
      description: 'Context compiler must surface AGENTS.md RULE #4. The controller must use UserService.countActiveUsers(), NOT direct database queries. Mark this as a critical implementation constraint.',
      mustContain: ['AGENTS.md', 'RULE #4', 'UserService', 'Controllers MUST NEVER'],
      mustNotInvent: ['new GraphQL gateway', 'Redis cached count'],
      shouldEscalate: false
    }
  },
  {
    id: 'case-10-insufficient-evidence-escalation',
    categoryNumber: 10,
    categoryName: 'Insufficient evidence requiring human escalation',
    title: 'Authentication token rejection with missing auth server logs',
    targetAgent: 'debugging',
    inputData: {
      workItem: 'Fix token validation error 403 in staging.',
      testOutput: 'AssertionError: Expected 200 OK, got 403 Forbidden',
      stackTrace: 'HTTP 403 Forbidden returned from opaque microservice proxy at 10.0.4.12:8443',
      sourceCode: [],
      changedFiles: [],
      repositoryRules: 'Security policy: Key rotation and JWT secret management are managed by separate SecOps vault.'
    },
    expectedBehavior: {
      description: 'Crucial test of engineering restraint: Zero source code, no response body, no server logs, opaque microservice proxy. Debugging agent MUST NOT fabricate a root cause. MUST set human_investigation_required = true. Explain reason for escalation: Insufficient telemetry and source code.',
      mustContain: ['insufficient', 'human investigation', 'logs'],
      mustNotInvent: ['expired JWT secret', 'CORS origin mismatch', 'invalid password hash'],
      shouldEscalate: true,
      expectedRootCauseKeywords: ['insufficient', 'opaque', 'unknown']
    }
  }
];
