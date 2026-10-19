import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AnalysisOverlay } from './components/layout/AnalysisOverlay';
import { Toaster } from './components/layout/Toaster';
import { useApp } from './state/AppContext';
import { Overview } from './pages/Overview';
import { EnvironmentGraph } from './pages/EnvironmentGraph';
import { Findings } from './pages/Findings';
import { AttackPaths } from './pages/AttackPaths';
import { Reasoning } from './pages/Reasoning';
import { Reports } from './pages/Reports';

export function App() {
  const { view, demoVersion } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main key={`${view}-${demoVersion}`} className="relative flex-1 overflow-hidden">
          {view === 'overview' && <Overview />}
          {view === 'graph' && <EnvironmentGraph />}
          {view === 'findings' && <Findings />}
          {view === 'paths' && <AttackPaths />}
          {view === 'reasoning' && <Reasoning />}
          {view === 'reports' && <Reports />}
        </main>
      </div>

      <AnalysisOverlay />
      <Toaster />
    </div>
  );
}
