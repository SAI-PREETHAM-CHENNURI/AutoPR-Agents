import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface Props {
  data: any;
  title?: string;
  badge?: string;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

export const JsonViewer: React.FC<Props> = ({
  data,
  title = 'Strict JSON Output',
  badge = 'Production Schema',
  defaultExpanded = true,
  maxHeight = 'max-h-96'
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-lg border border-slate-800 overflow-hidden shadow-sm font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/50 rounded text-[10px]">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors border border-slate-700"
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={`p-3 ${maxHeight} overflow-auto bg-slate-900/90 text-slate-200 leading-relaxed font-mono`}>
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>
      )}
    </div>
  );
};
