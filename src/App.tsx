import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { WorkItemTab } from './components/WorkItemTab';
import { ContextCompilerTab } from './components/ContextCompilerTab';
import { DebuggingTab } from './components/DebuggingTab';
import { IntegrationTestModeTab } from './components/IntegrationTestModeTab';
import { AdversarialEvaluationTab } from './components/AdversarialEvaluationTab';
import { PipelineSimulationTab } from './components/PipelineSimulationTab';
import { AntigravityIntegrationGuideTab } from './components/AntigravityIntegrationGuideTab';
import { GitPullRequest, ShieldCheck, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('work-item');
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);
  const [serverHealthy, setServerHealthy] = useState<boolean>(true);

  useEffect(() => {
    // Health check on startup
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setServerHealthy(data.status === 'ok');
        setGeminiConnected(data.geminiConnected ?? true);
      })
      .catch(err => {
        console.warn('Backend ping warning:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* System Navigation & Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        geminiConnected={geminiConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'work-item' && <WorkItemTab />}
        {activeTab === 'context-compiler' && <ContextCompilerTab />}
        {activeTab === 'debugging' && <DebuggingTab />}
        {activeTab === 'integration-test' && <IntegrationTestModeTab />}
        {activeTab === 'adversarial' && <AdversarialEvaluationTab />}
        {activeTab === 'pipeline' && <PipelineSimulationTab />}
        {activeTab === 'guide' && <AntigravityIntegrationGuideTab />}
      </main>

      {/* Technical Footer & Boundary Enforcement Bar */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-slate-400" />
            <span className="font-mono font-semibold text-slate-700">Auto PR</span>
            <span>— Autonomous Software-Engineering AI Reasoning Service (v1.0 Frozen)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Epistemic Auditing: Active
            </span>
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              Validation Authority: Antigravity Sandbox
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
