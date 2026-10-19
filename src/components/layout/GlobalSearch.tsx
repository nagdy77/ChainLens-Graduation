import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { assets, identities, privileges, dependencies, findings, attackPaths } from '../../data/mockData';
import { iconForEntity, entityTypeLabel } from '../entityVisuals';
import { useApp } from '../../state/AppContext';
import { cn } from '../../lib/cn';
import { Mono } from '../ui';
import { Route } from 'lucide-react';

interface Result {
  id: string;
  title: string;
  sub: string;
  kind: 'entity' | 'finding' | 'path';
  entityType?: 'asset' | 'identity' | 'privilege' | 'dependency' | 'finding';
  go: () => void;
}

export function GlobalSearch() {
  const { setView, selectNode, focusEntity, selectPath } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Result[] = [];

    const graphEntities = [
      ...assets.map((e) => ({ e, t: 'asset' as const })),
      ...identities.map((e) => ({ e, t: 'identity' as const })),
      ...privileges.map((e) => ({ e, t: 'privilege' as const })),
      ...dependencies.map((e) => ({ e, t: 'dependency' as const })),
    ];
    for (const { e, t } of graphEntities) {
      const hay = `${e.id} ${e.name}`.toLowerCase();
      if (hay.includes(term)) {
        out.push({
          id: e.id,
          title: e.name,
          sub: `${e.id} · ${entityTypeLabel[t]}`,
          kind: 'entity',
          entityType: t,
          go: () => {
            setView('graph');
            focusEntity(e.id);
            selectNode(e.id);
          },
        });
      }
    }
    for (const f of findings) {
      const hay = `${f.id} ${f.title}`.toLowerCase();
      if (hay.includes(term)) {
        out.push({
          id: f.id,
          title: f.title,
          sub: `${f.id} · Finding`,
          kind: 'finding',
          entityType: 'finding',
          go: () => {
            setView('findings');
            focusEntity(f.id);
          },
        });
      }
    }
    for (const p of attackPaths) {
      const hay = `${p.id} ${p.title} ${p.scenario}`.toLowerCase();
      if (hay.includes(term)) {
        out.push({
          id: p.id,
          title: p.title,
          sub: `${p.id} · Attack path`,
          kind: 'path',
          go: () => {
            selectPath(p.id);
            setView('paths');
          },
        });
      }
    }
    return out.slice(0, 8);
  }, [q, setView, selectNode, focusEntity, selectPath]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const choose = (r: Result) => {
    r.go();
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => (a - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              choose(results[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Search assets, findings, paths…"
          aria-label="Global search"
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-16 text-[13px] text-text placeholder:text-faint focus:border-cyan/50 focus:outline-none"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-panel px-1.5 py-0.5 font-mono text-[10px] text-faint">
          ⌘K
        </kbd>
      </div>

      {open && q && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-surface-2 shadow-2xl animate-fade-in">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted">
              No matches for “{q}”.
            </div>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto py-1.5">
              {results.map((r, i) => {
                const Icon = r.kind === 'path' ? Route : iconForEntity(r.entityType ?? 'asset', r.id);
                return (
                  <li key={`${r.kind}-${r.id}`}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(r)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left',
                        i === active ? 'bg-surface' : '',
                      )}
                    >
                      <Icon size={15} className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-text">{r.title}</span>
                        <Mono className="text-[10.5px] text-faint">{r.sub}</Mono>
                      </span>
                      {i === active && <CornerDownLeft size={13} className="text-faint" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
