import { Printer, Download, FileText, FlaskConical, Check, X, Minus } from 'lucide-react';
import {
  assets,
  identities,
  privileges,
  findings,
  attackPaths,
  mitigations,
  zones,
  allSources,
  assetById,
  ENVIRONMENT_NAME,
  ENVIRONMENT_STATUS,
} from '../data/mockData';
import { rankedPaths, scorePath, SCORE_WEIGHTS } from '../data/scoring';
import { Button, Badge, Mono } from '../components/ui';
import { useApp } from '../state/AppContext';
import type { CheckResult } from '../data/types';
import { cn } from '../lib/cn';

const checkMark: Record<CheckResult, React.ReactNode> = {
  pass: <Check size={11} className="text-success" />,
  fail: <X size={11} className="text-critical" />,
  'n/a': <Minus size={11} className="text-faint" />,
};

export function Reports() {
  const { pushToast } = useApp();
  const feasible = rankedPaths(attackPaths.filter((p) => p.feasibility === 'feasible'));
  const rejected = attackPaths.filter((p) => p.feasibility === 'rejected');
  const today = new Date().toISOString().slice(0, 10);

  const buildJson = () => {
    return {
      meta: {
        product: 'CHAINLENS — LLM-Assisted Vulnerability Chain Reasoner',
        type: 'Laboratory demonstration · simulated analysis',
        disclaimer:
          'Predefined laboratory demonstration data. Not a measured research result. Findings are confirmed observations; attack paths are inferred possibilities.',
        generatedAt: new Date().toISOString(),
        environment: ENVIRONMENT_NAME,
        environmentStatus: ENVIRONMENT_STATUS,
      },
      scope: {
        zones: zones.map((z) => ({ id: z.id, name: z.name })),
        assets: assets.length,
        identities: identities.length,
        privileges: privileges.length,
        findings: findings.length,
      },
      scoreModel: { weights: SCORE_WEIGHTS, note: 'Illustrative ranking aid, not a validated security metric.' },
      inputSources: allSources.map((s) => ({ source: s, findings: findings.filter((f) => f.source === s).length })),
      findings: findings.map((f) => ({
        id: f.id,
        title: f.title,
        asset: f.assetId,
        source: f.source,
        severity: f.severity,
        status: f.status,
        confidence: f.confidence,
        lastObserved: f.lastObserved,
      })),
      feasiblePaths: feasible.map((p) => ({
        id: p.id,
        title: p.title,
        demoPriorityScore: scorePath(p).total,
        startingAccess: p.startingAccess,
        target: p.targetAssetId,
        steps: p.steps.length,
        impact: p.impact,
        effort: p.effort,
        likelihood: p.likelihood,
        evidenceConfidence: p.evidenceConfidence,
        deterministicChecks: p.checks.map((c) => ({ check: c.id, result: c.result })),
        llmAgreement: p.llm.agreement,
      })),
      rejectedPaths: rejected.map((p) => ({ id: p.id, title: p.title, reason: p.rejectionReason })),
      mitigations: mitigations.map((m) => ({ id: m.id, label: m.label, blocks: m.blocksPathIds })),
      limitations: [
        'Frontend-only prototype using predefined mock data.',
        'No backend, scanning, exploitation, or live LLM calls.',
        'Likelihood is an illustrative expert-style assessment, not a calibrated probability.',
        'The system combines existing findings; it does not predict undiscovered vulnerabilities.',
      ],
    };
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(buildJson(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainlens-analysis-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast('Mock analysis downloaded as JSON.', 'success');
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-6 py-3">
        <div>
          <h1 className="text-[15px] font-bold tracking-tight text-text leading-none">Reports</h1>
          <p className="mt-1 text-[11px] text-muted">Preview the analysis report, then print to PDF or export JSON</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={downloadJson}>
            <Download size={15} /> Download JSON
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Report document */}
      <div className="px-6 py-6">
        <article className="print-surface mx-auto max-w-[880px] rounded-2xl border border-border bg-panel p-8 sm:p-10">
          {/* Letterhead */}
          <header className="border-b border-border pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30">
                    <FileText size={16} className="text-cyan" />
                  </span>
                  <span className="text-[15px] font-bold tracking-tight text-text">
                    CHAIN<span className="text-cyan">LENS</span>
                  </span>
                </div>
                <h2 className="mt-3 text-[22px] font-bold leading-tight text-text">
                  Vulnerability Chain Analysis Report
                </h2>
                <p className="mt-1 text-[13px] text-muted">LLM-Assisted Vulnerability Chain Reasoner · {ENVIRONMENT_NAME}</p>
              </div>
              <div className="text-right text-[11px] text-muted print-muted">
                <div>Generated {today}</div>
                <div>{ENVIRONMENT_STATUS}</div>
                <div className="mt-1">Report ID: CL-RPT-{today.replace(/-/g, '')}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet/30 bg-violet/10 px-3 py-2 print-surface">
              <FlaskConical size={14} className="text-violet" />
              <p className="text-[11.5px] text-violet/90 print-muted">
                These results come from a <strong>predefined laboratory demonstration</strong> with simulated analysis.
                They are not measured research findings. Findings are confirmed observations; attack paths are inferred
                possibilities.
              </p>
            </div>
          </header>

          {/* Executive summary */}
          <Section n="1" title="Executive summary">
            <p>
              CHAINLENS modeled the <strong>{ENVIRONMENT_NAME}</strong> environment as a graph of {assets.length} assets,{' '}
              {identities.length} identities, and {privileges.length} privilege roles across {zones.length} trust zones.
              From {findings.length} confirmed findings — predominantly low severity — the system enumerated{' '}
              {attackPaths.length} candidate attack chains. Deterministic feasibility checks accepted{' '}
              <strong>{feasible.length}</strong> and rejected <strong>{rejected.length}</strong>. A simulated LLM layer
              then explained and ranked the surviving chains.
            </p>
            <p className="mt-2">
              The highest-ranked chain is <Mono className="text-cyan">{feasible[0]?.id}</Mono> —{' '}
              {feasible[0]?.title} (demo priority score {scorePath(feasible[0]).total}). The dominant theme is
              over-provisioning: a shared service identity, over-broad database read, excessive file-share permissions,
              and an unnecessary internal network route each combine individually low-severity findings into
              higher-impact paths.
            </p>
          </Section>

          {/* Environment scope */}
          <Section n="2" title="Environment scope">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
              {zones.map((z) => {
                const count = assets.filter((a) => a.zone === z.id).length;
                return (
                  <div key={z.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2 print-surface">
                    <span className="text-[12px] text-muted">{z.name}</span>
                    <span className="text-[13px] font-semibold text-text tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11.5px] text-faint print-muted">
              {assets.length} assets total. Key systems include the Public Web Portal, Application API, Configuration
              Repository, Customer Database, Backup Service, and the Identity Provider.
            </p>
          </Section>

          {/* Input-source summary */}
          <Section n="3" title="Input-source summary">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint print-muted">
                  <th className="py-1.5 font-medium">Evidence source</th>
                  <th className="py-1.5 font-medium text-right">Findings</th>
                </tr>
              </thead>
              <tbody>
                {allSources.map((s) => (
                  <tr key={s} className="border-b border-border/60">
                    <td className="py-1.5 text-muted">{s}</td>
                    <td className="py-1.5 text-right font-semibold text-text tabular-nums">
                      {findings.filter((f) => f.source === s).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Ranked feasible paths */}
          <Section n="4" title="Ranked feasible paths">
            <div className="space-y-2">
              {feasible.map((p, i) => (
                <div key={p.id} className="rounded-lg border border-border bg-surface/40 p-3 print-surface">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-cyan">#{i + 1}</span>
                        <Mono className="text-[11px] text-faint">{p.id}</Mono>
                        <span className="text-[13px] font-semibold text-text">{p.title}</span>
                      </div>
                      <p className="mt-1 text-[11.5px] text-muted">
                        {p.startingAccess} → {assetById(p.targetAssetId)?.name} · {p.steps.length} steps ·{' '}
                        {p.zonesCrossed.length} zones · {p.likelihood} likelihood · {p.evidenceConfidence} evidence
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] uppercase tracking-wide text-faint print-muted">Score</div>
                      <div className="text-[18px] font-bold text-text tabular-nums">{scorePath(p).total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Rejected paths */}
          <Section n="5" title="Rejected paths & rejection reasons">
            <div className="space-y-2">
              {rejected.map((p) => (
                <div key={p.id} className="rounded-lg border border-critical/30 bg-critical/5 p-3 print-surface">
                  <div className="flex items-center gap-2">
                    <Mono className="text-[11px] text-critical">{p.id}</Mono>
                    <span className="text-[12.5px] font-semibold text-text">{p.title}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{p.rejectionReason}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Evidence and uncertainty */}
          <Section n="6" title="Evidence & uncertainty">
            <p className="mb-2">
              Severity and evidence confidence are tracked separately: a low-severity finding may carry strong
              supporting evidence. Residual uncertainty across feasible paths centers on steps marked as inferred
              transitions or required assumptions.
            </p>
            <ul className="space-y-1.5">
              {feasible.slice(0, 3).map((p) => (
                <li key={p.id} className="text-[12px] text-muted">
                  <Mono className="text-[10.5px] text-faint">{p.id}</Mono> — {p.missingEvidence[0]}
                </li>
              ))}
            </ul>
          </Section>

          {/* Mitigations */}
          <Section n="7" title="Suggested mitigations">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {mitigations.map((m) => (
                <div key={m.id} className="rounded-lg border border-border bg-surface/40 p-2.5 print-surface">
                  <div className="flex items-center gap-1.5">
                    <Mono className="text-[10px] text-faint">{m.id}</Mono>
                    <Badge tone="neutral">{m.category}</Badge>
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-text">{m.label}</div>
                  <div className="mt-0.5 text-[10.5px] text-faint print-muted">Blocks {m.blocksPathIds.join(', ')}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Deterministic vs LLM */}
          <Section n="8" title="Deterministic vs LLM comparison">
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-faint print-muted">
                  <th className="py-1.5 font-medium">Path</th>
                  <th className="py-1.5 font-medium">Deterministic</th>
                  <th className="py-1.5 font-medium">LLM</th>
                  <th className="py-1.5 font-medium">Agreement</th>
                </tr>
              </thead>
              <tbody>
                {attackPaths.map((p) => {
                  const failed = p.checks.filter((c) => c.result === 'fail');
                  return (
                    <tr key={p.id} className="border-b border-border/60 align-top">
                      <td className="py-1.5"><Mono className="text-cyan">{p.id}</Mono></td>
                      <td className="py-1.5">
                        <span className="inline-flex items-center gap-1">
                          {failed.length ? checkMark.fail : checkMark.pass}
                          <span className={cn(failed.length ? 'text-critical' : 'text-success')}>
                            {failed.length ? 'Rejected' : 'Pass'}
                          </span>
                        </span>
                      </td>
                      <td className="py-1.5 text-muted">
                        {p.feasibility === 'rejected' ? 'Not ranked' : `${p.likelihood}`}
                      </td>
                      <td className="py-1.5 capitalize text-muted">{p.llm.agreement.replace('-', ' ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-faint print-muted">
              The simulated LLM layer never overrides a failed hard constraint.
            </p>
          </Section>

          {/* Limitations */}
          <Section n="9" title="Research limitations">
            <ul className="space-y-1.5">
              {[
                'Frontend-only prototype using predefined, fictional mock data.',
                'No backend, no scanning, no exploitation, and no live LLM calls.',
                'Likelihood and the demo priority score are illustrative, not calibrated or validated metrics.',
                'The system combines existing confirmed findings; it does not predict undiscovered vulnerabilities.',
              ].map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" />
                  {l}
                </li>
              ))}
            </ul>
          </Section>

          <footer className="mt-8 border-t border-border pt-4 text-center text-[10.5px] text-faint print-muted">
            CHAINLENS laboratory demonstration · Simulated analysis · Generated {today} · Not for operational use
          </footer>
        </article>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-text">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan/10 text-[11px] font-bold text-cyan print-surface">
          {n}
        </span>
        {title}
      </h3>
      <div className="text-[12.5px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}
