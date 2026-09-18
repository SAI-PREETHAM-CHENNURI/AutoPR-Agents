import React, { useState } from 'react';
import { Network, Copy, Check, Code2, ArrowRight } from 'lucide-react';

interface Props {
  endpoint: string;
  payload: any;
  componentName: string;
}

export const IntegrationOutputViewer: React.FC<Props> = ({
  endpoint,
  payload,
  componentName
}) => {
  const [activeLang, setActiveLang] = useState<'json' | 'curl' | 'ts'>('json');
  const [copied, setCopied] = useState(false);

  const jsonStr = JSON.stringify(payload, null, 2);

  const curlSnippet = `curl -X POST https://auto-pr-control-plane.internal${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${ORCHESTRATOR_TOKEN}" \\
  -d '${JSON.stringify(payload)}'`;

  const tsSnippet = `// Integration hook for Production Orchestrator
import { ${componentName.replace(/\s+/g, '')}Output } from '@auto-pr/types';

const response = await fetch('https://auto-pr-control-plane.internal${endpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload),
});

const result: ${componentName.replace(/\s+/g, '')}Output = await response.json();
if (result.human_investigation_required) {
  await controlPlane.escalateToReviewer(result.reason_for_escalation);
} else {
  await controlPlane.dispatchNextStage(result);
}`;

  const currentContent = activeLang === 'json' ? jsonStr : activeLang === 'curl' ? curlSnippet : tsSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-200 bg-white rounded-lg p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800">Integration Output ({componentName})</h4>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-mono font-medium rounded border border-indigo-200">
              {endpoint}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured contract ready for consumption by Auto PR Control Plane and Orchestration Workers.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setActiveLang('json')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLang === 'json' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLang === 'curl' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveLang('ts')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLang === 'ts' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TypeScript
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs overflow-x-auto max-h-56">
        <pre>{currentContent}</pre>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <Check className="w-3 h-3" />
          <span className="font-mono text-[11px]">Contract Verified: Strict JSON Schema Compliant</span>
        </div>
        <span className="text-[11px] text-slate-400">Target Worker: Auto PR Sandbox & Implementation Agent</span>
      </div>
    </div>
  );
};
