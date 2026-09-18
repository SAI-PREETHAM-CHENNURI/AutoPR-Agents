import React from 'react';
import { EpistemicCategory } from '../types';
import { ShieldCheck, Sparkles, HelpCircle, AlertTriangle } from 'lucide-react';

interface Props {
  category: EpistemicCategory | string;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<Props> = ({ category, size = 'sm' }) => {
  const cat = (category || 'FACT').toUpperCase() as EpistemicCategory;

  const config = {
    FACT: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      tooltip: 'FACT: Grounded directly in supplied code, logs, or prompt text.'
    },
    INFERENCE: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: Sparkles,
      tooltip: 'INFERENCE: Logical deduction strictly derived from observed facts.'
    },
    ASSUMPTION: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      tooltip: 'ASSUMPTION: Working hypothesis that has not been directly validated.'
    },
    UNKNOWN: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: HelpCircle,
      tooltip: 'UNKNOWN: Missing information, unstated constraint, or unverifiable metric.'
    }
  }[cat] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: ShieldCheck,
    tooltip: 'Unclassified evidence'
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1 font-mono rounded border uppercase tracking-wider ${config.bg} ${sizeClasses}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {cat}
    </span>
  );
};
