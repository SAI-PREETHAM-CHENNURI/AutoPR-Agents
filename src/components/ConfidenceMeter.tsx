import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  confidence: number;
  label?: string;
  showDisclaimer?: boolean;
}

export const ConfidenceMeter: React.FC<Props> = ({ confidence, label = 'Reasoning Confidence', showDisclaimer = true }) => {
  const percentage = Math.round(Math.min(1, Math.max(0, confidence)) * 100);

  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-600';
  let Icon = CheckCircle2;

  if (percentage < 50) {
    statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
    Icon = AlertTriangle;
  } else if (percentage < 80) {
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
    Icon = AlertCircle;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Icon className="w-4 h-4 text-slate-500" />
          <span>{label}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${statusColor}`}>
          {(confidence).toFixed(2)} ({percentage}%)
        </span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDisclaimer && (
        <p className="mt-2 text-[11px] text-slate-500 leading-tight">
          <span className="font-semibold text-slate-600">Verification Boundary:</span> Confidence communicates model certainty given supplied evidence. It is <strong className="text-slate-700">not proof of execution</strong>.
        </p>
      )}
    </div>
  );
};
