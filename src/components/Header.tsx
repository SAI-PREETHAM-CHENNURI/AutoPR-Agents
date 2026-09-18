import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Bug,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Workflow,
  BookOpen,
  Info
} from 'lucide-react';

export type AppTab =
  | 'work-item'
  | 'context-compiler'
  | 'debugging'
  | 'integration-test'
  | 'adversarial'
  | 'pipeline'
  | 'guide';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  geminiConnected: boolean;
}

export const Header: React.FC<Props> = ({ activeTab, onTabChange, geminiConnected }) => {
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and system identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GitPullRequest className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight font-mono">Auto PR</span>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold rounded border border-slate-300">
                  AI REASONING SERVICE
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded border border-emerald-200">
                  v1.0 FROZEN
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Cognitive substrate for autonomous software engineering
              </p>
            </div>
          </div>

          {/* Core Architectural Principle Banner */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200/80 rounded-full text-xs text-amber-900">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-semibold text-amber-900">Contract:</span>
            <span className="text-amber-800">Antigravity Sandbox is truth — AI reasoning is hypothesis.</span>
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="text-amber-700 hover:text-amber-900 underline ml-1 font-medium cursor-pointer"
            >
              Arch Spec
            </button>
          </div>

          {/* Model Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>gemini-2.5-flash</span>
              <span className={`w-2 h-2 rounded-full ${geminiConnected ? 'bg-emerald-500' : 'bg-emerald-400 animate-pulse'}`} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-t border-slate-100 py-1 overflow-x-auto">
          <button
            onClick={() => onTabChange('work-item')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'work-item'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Work Item</span>
          </button>

          <button
            onClick={() => onTabChange('context-compiler')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'context-compiler'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>2. Context Compiler</span>
          </button>

          <button
            onClick={() => onTabChange('debugging')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'debugging'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>3. Debugging Agent</span>
          </button>

          <button
            onClick={() => onTabChange('integration-test')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'integration-test'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Integration Test Mode</span>
          </button>

          <button
            onClick={() => onTabChange('adversarial')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'adversarial'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>15 Adversarial Tests</span>
          </button>

          <button
            onClick={() => onTabChange('pipeline')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>E2E Handoff Simulation</span>
          </button>

          <button
            onClick={() => onTabChange('guide')}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Antigravity Guide</span>
          </button>
        </div>
      </div>

      {/* System Architecture Modal */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Auto PR Architecture & Boundary</h3>
              </div>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="my-4 text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto leading-relaxed">
              <pre>{`USER / DEVELOPER
    ↓
ANTIGRAVITY CONTROL PLANE
    ↓
[1] WORK ITEM UNDERSTANDING AGENT (AI Studio Service)
    ↓
CONTEXT DISCOVERY
    ↓
[2] CONTEXT COMPILER (AI Studio Service)
    ↓
IMPLEMENTATION AGENT
    ↓
ISOLATED DEV SANDBOX (Antigravity Host)
    ↓
VALIDATION ENGINE (Tests, Build, Types)
    ↓
VALIDATION GATE
    ├── PASS → PR QUALITY GATE → PR GENERATOR (Antigravity Host)
    └── FAIL → [3] DEBUGGING AGENT (AI Studio Service)
                    ↓
              IMPLEMENTATION AGENT
                    ↓
                RE-VALIDATE (Sandbox Loop)`}</pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <strong className="block mb-1 text-blue-950 font-semibold">Boundary Specification:</strong>
              This application implements and validates the three critical AI reasoning components ([1], [2], [3]) and provides standardized API contracts for Antigravity. Sandbox execution, Git worktrees, and PR dispatch remain in Antigravity.
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
