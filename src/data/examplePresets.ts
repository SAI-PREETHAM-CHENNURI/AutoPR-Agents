export interface WorkItemPreset {
  id: string;
  name: string;
  description: string;
  workItem: string;
  systemContext?: string;
}

export interface ContextCompilerPreset {
  id: string;
  name: string;
  description: string;
  workItem: string;
  repositoryFiles: { path: string; content: string }[];
  repositoryRules: string;
  domainDocumentation: string;
  testFiles: { path: string; content: string }[];
}

export interface DebuggingPreset {
  id: string;
  name: string;
  description: string;
  workItem: string;
  testOutput: string;
  stackTrace: string;
  sourceCode: { path: string; content: string }[];
  changedFiles: { path: string; diffOrContent: string }[];
  repositoryRules: string;
  previousAttempts?: string[];
}

export const WORK_ITEM_PRESETS: WorkItemPreset[] = [
  {
    id: 'preset-users-pagination',
    name: 'Add Pagination to /users API',
    description: 'Standard feature request with clear default parameters.',
    workItem: 'Add pagination to the /users API. The default page size should be 20 and clients should be able to specify a page number.',
    systemContext: 'User service handles ~50,000 active customer records. Response payloads currently return unpaginated JSON arrays.'
  },
  {
    id: 'preset-ambiguous-perf',
    name: 'Make Application Faster (Ambiguity Test)',
    description: 'Unbounded performance goal lacking metrics, SLAs, or specific endpoints.',
    workItem: 'Make the application faster. Several enterprise customers complained that our dashboard feels sluggish in peak hours.',
    systemContext: 'Monolith application with PostgreSQL, Redis cache, and React frontend.'
  },
  {
    id: 'preset-conflicting-limits',
    name: 'Webhook Payload Size vs Mandatory Telemetry (Conflict Test)',
    description: 'Direct contradiction between strict byte size constraint and mandatory fields.',
    workItem: 'Update the Webhook payload serializer. The payload MUST strictly remain under 128 bytes for legacy edge forwarders. In addition, include 6 new mandatory customer audit telemetry fields (~250 bytes) in the JSON root object.',
    systemContext: 'Edge IoT ingestion service.'
  }
];

export const CONTEXT_COMPILER_PRESETS: ContextCompilerPreset[] = [
  {
    id: 'preset-token-expiration',
    name: 'Token Expiration Verification',
    description: 'Auth service requiring RFC 7519 exp timestamp validation with strict UTC repository rule.',
    workItem: 'Update JWT authentication in auth/token_service.py to enforce token expiration timestamps ("exp" claim). Reject expired tokens immediately.',
    repositoryFiles: [
      {
        path: 'auth/token_service.py',
        content: `import jwt

SECRET = "supersecretkey"

class TokenService:
    def verify_token(self, token_str: str) -> dict:
        """Decodes and validates token signature."""
        payload = jwt.decode(token_str, SECRET, algorithms=["HS256"])
        # TODO: verify exp claim
        return payload`
      },
      {
        path: 'auth/errors.py',
        content: `class AuthError(Exception): pass
class TokenExpiredError(AuthError): pass
class InvalidTokenError(AuthError): pass`
      },
      {
        path: 'services/user_service.py',
        content: `class UserService:
    def get_user_profile(self, user_id: str):
        return {"id": user_id, "status": "active"}`
      }
    ],
    repositoryRules: `AGENTS.md:
1. Always use timezone-aware UTC timestamps: datetime.now(timezone.utc).
2. Never import deprecated datetime.utcnow().
3. Raise explicit domain exceptions defined in auth/errors.py.
4. Keep functions under 40 lines.`,
    domainDocumentation: `RFC 7519 JSON Web Token (JWT):
The "exp" (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted for processing. Its value MUST be a number containing a NumericDate value representing seconds since Unix Epoch.`,
    testFiles: [
      {
        path: 'tests/test_token_service.py',
        content: `from auth.token_service import TokenService

def test_verify_valid_token():
    svc = TokenService()
    # verify valid token works
    assert svc.verify_token(MOCK_TOKEN)["sub"] == "user_1"`
      }
    ]
  },
  {
    id: 'preset-payment-webhook',
    name: 'Stripe Webhook Idempotency',
    description: 'Handling duplicate incoming webhook notifications using Redis locks.',
    workItem: 'Prevent double-processing of Stripe charge webhooks by recording event ID in redis with 24-hour TTL.',
    repositoryFiles: [
      {
        path: 'api/webhooks.py',
        content: `def handle_stripe_event(event):
    event_id = event["id"]
    # Process event without deduplication check
    order_id = event["data"]["object"]["metadata"]["order_id"]
    order_service.fulfill(order_id)
    return {"status": "success"}`
      },
      {
        path: 'infra/redis_client.py',
        content: `import redis
redis_client = redis.Redis(host="redis.internal", port=6379)`
      }
    ],
    repositoryRules: `CONTRIBUTING.md:
- Idempotency checks must use SETNX with explicit TTL in seconds.
- Log duplicate events with level INFO.`,
    domainDocumentation: `Stripe Webhook Delivery:
Webhooks may be delivered multiple times for the same event due to network retries. Consumer systems must be idempotent.`,
    testFiles: [
      {
        path: 'tests/test_webhooks.py',
        content: `def test_handle_stripe_event():
    res = handle_stripe_event({"id": "evt_123", "data": {"object": {"metadata": {"order_id": "ord_99"}}}})
    assert res["status"] == "success"`
      }
    ]
  }
];

export const DEBUGGING_PRESETS: DebuggingPreset[] = [
  {
    id: 'preset-password-reset-expired-token',
    name: 'Expired Password Reset Token Returns 200 (Spec Example)',
    description: 'AssertionError: Expected HTTP 401 Unauthorized but got HTTP 200 OK.',
    workItem: 'Reject password reset requests using expired reset tokens with 401 Unauthorized.',
    testOutput: `FAIL: test_password_reset_expired_token
======================================================================
ERROR: test_password_reset_expired_token (tests.test_auth)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "tests/test_auth.py", line 64, in test_password_reset_expired_token
    assert response.status_code == 401
AssertionError: Expected 401, got 200`,
    stackTrace: `tests/test_auth.py:64: in test_password_reset_expired_token
  response = client.post("/api/v1/auth/reset-password", json={"token": expired_token, "new_password": "NewSecretPassword123!"})
  E AssertionError: assert 200 == 401`,
    sourceCode: [
      {
        path: 'auth/password_reset.py',
        content: `def reset_password(token: str, new_password: str):
    record = token_repo.find_by_token(token)
    if not record:
        return {"status_code": 404, "error": "Token not found"}
    
    # BUG: Condition is inverted: checks if current time is LESS than expiry to reject!
    now = datetime.now(timezone.utc)
    if now < record.expires_at:
        return {"status_code": 401, "error": "Token expired"}
        
    user_repo.update_password(record.user_id, hash_password(new_password))
    return {"status_code": 200, "message": "Password updated"}`
      }
    ],
    changedFiles: [
      {
        path: 'auth/password_reset.py',
        diffOrContent: `@@ -10,2 +10,2 @@
- if now > record.expires_at:
+ if now < record.expires_at:`
      }
    ],
    repositoryRules: `AGENTS.md:
- Check error status codes: 401 for authentication/token expiration, 404 for missing records.
- All timestamps must be compared in timezone.utc.`,
    previousAttempts: [
      'Attempt 1: Changed response JSON message string, but test still failed because HTTP status code was 200.'
    ]
  },
  {
    id: 'preset-slice-off-by-one',
    name: 'Off-by-One Array Slicing Bug',
    description: 'Unit test fails because slice excludes the last element.',
    workItem: 'Return top 5 trending tags.',
    testOutput: `FAIL: tests/test_tags.py::test_top_tags
AssertionError: Expected 5 elements, got 4.
Expected: ['ai', 'react', 'python', 'docker', 'rust']
Actual: ['ai', 'react', 'python', 'docker']`,
    stackTrace: `tests/test_tags.py:18: in test_top_tags
    assert len(get_trending_tags(all_tags, limit=5)) == 5
E   AssertionError: assert 4 == 5`,
    sourceCode: [
      {
        path: 'services/tags.py',
        content: `def get_trending_tags(tags: list[str], limit: int = 5) -> list[str]:
    # Bug: tags[:limit - 1] returns limit - 1 items
    return tags[:limit - 1]`
      }
    ],
    changedFiles: [
      {
        path: 'services/tags.py',
        diffOrContent: `@@ -2,2 +2,2 @@
- return tags[:limit]
+ return tags[:limit - 1]`
      }
    ],
    repositoryRules: 'CONTRIBUTING.md: Default limit is 5 items.'
  },
  {
    id: 'preset-insufficient-logs',
    name: 'Opaque 502 Bad Gateway (Insufficient Evidence)',
    description: 'External upstream gateway failure with no logs, testing human escalation.',
    workItem: 'Resolve 502 Bad Gateway error on /checkout.',
    testOutput: 'HTTP 502 Bad Gateway: Upstream connection closed prematurely.',
    stackTrace: 'NetworkSocketError: read ECONNRESET at TLSWrap.onStreamRead (node:internal/stream_base_commons:217:20)',
    sourceCode: [],
    changedFiles: [],
    repositoryRules: 'Security policy: Direct access to upstream microservice logs requires VPN tunnel.',
    previousAttempts: []
  }
];
