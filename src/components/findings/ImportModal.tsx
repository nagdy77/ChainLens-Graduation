import { useRef, useState } from 'react';
import { X, UploadCloud, FileJson, CheckCircle2, Info, Database } from 'lucide-react';
import { Button, Badge, SectionLabel, Mono } from '../ui';
import { allSources, findings } from '../../data/mockData';
import { useApp } from '../../state/AppContext';
import { cn } from '../../lib/cn';

interface PreviewState {
  fileName: string;
  records: number;
  accepted: number;
  skipped: number;
  source: string;
}

export function ImportModal({ onClose }: { onClose: () => void }) {
  const { pushToast } = useApp();
  const [source, setSource] = useState<string>(allSources[0]);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.json')) {
      setError('Only .json files are accepted in this demo. Nothing was uploaded.');
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed.findings) ? parsed.findings : null;
        if (!arr) {
          setError('Could not find a findings array. Expected a JSON array or { "findings": [...] }.');
          setPreview(null);
          return;
        }
        const accepted = arr.filter((r: unknown) => r && typeof r === 'object' && ('title' in r! || 'id' in r!)).length;
        setPreview({
          fileName: file.name,
          records: arr.length,
          accepted,
          skipped: arr.length - accepted,
          source,
        });
      } catch {
        setError('That file is not valid JSON. Validation failed; nothing was imported.');
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setError(null);
    setPreview({
      fileName: 'graduation-lab-sample.json',
      records: findings.length,
      accepted: findings.length,
      skipped: 0,
      source: 'Mixed (sample dataset)',
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/55 animate-fade-in" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-label="Import findings">
        <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-panel shadow-2xl animate-fade-in">
          {/* header */}
          <div className="flex items-start justify-between border-b border-border p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
                <UploadCloud size={18} />
              </span>
              <div>
                <h2 className="text-[16px] font-semibold text-text">Import findings</h2>
                <p className="mt-0.5 text-[12px] text-muted">Load findings from a local JSON file or the bundled sample.</p>
              </div>
            </div>
            <button onClick={onClose} className="text-faint hover:text-text" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
            {/* local-only notice */}
            <div className="flex items-start gap-2 rounded-lg border border-violet/30 bg-violet/10 px-3 py-2.5">
              <Info size={15} className="mt-0.5 shrink-0 text-violet" />
              <p className="text-[11.5px] leading-relaxed text-violet/90">
                This is a local demonstration. Import <span className="font-semibold">does not contact scanners or upload
                files anywhere</span> — parsing happens entirely in your browser.
              </p>
            </div>

            {/* source selector */}
            <div>
              <SectionLabel className="mb-2">Source type</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {allSources.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors',
                      source === s ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-border bg-surface text-muted hover:text-text',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* dropzone */}
            <div>
              <SectionLabel className="mb-2">Upload</SectionLabel>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className={cn(
                  'grid place-items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                  dragOver ? 'border-cyan bg-cyan/5' : 'border-border bg-surface/40',
                )}
              >
                <FileJson size={28} className="mb-2 text-faint" />
                <p className="text-[12.5px] text-text">Drag & drop a JSON file here</p>
                <p className="mt-0.5 text-[11px] text-muted">or</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="default" onClick={() => inputRef.current?.click()}>
                    Choose file
                  </Button>
                  <Button size="sm" variant="ghost" onClick={loadSample}>
                    <Database size={13} /> Load sample dataset
                  </Button>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            </div>

            {/* validation / preview */}
            {error && (
              <div className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2.5 text-[12px] text-critical">
                {error}
              </div>
            )}
            {preview && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success" />
                  <span className="text-[13px] font-semibold text-text">Validation summary</span>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <FileJson size={13} className="text-faint" />
                  <Mono className="text-[11.5px] text-muted">{preview.fileName}</Mono>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Records" value={preview.records} tone="text" />
                  <Stat label="Valid" value={preview.accepted} tone="success" />
                  <Stat label="Skipped" value={preview.skipped} tone={preview.skipped ? 'warning' : 'muted'} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-muted">Tagged source:</span>
                  <Badge tone="cyan">{preview.source}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border p-4">
            <p className="text-[11px] text-faint">Demo import maps records to the existing dataset view.</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!preview}
                onClick={() => {
                  pushToast(
                    `Imported ${preview?.accepted ?? 0} findings (demo) — dataset view unchanged.`,
                    'success',
                  );
                  onClose();
                }}
              >
                Import {preview ? `${preview.accepted}` : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'text' | 'success' | 'warning' | 'muted' }) {
  const toneMap = {
    text: 'text-text',
    success: 'text-success',
    warning: 'text-warning',
    muted: 'text-faint',
  };
  return (
    <div className="rounded-lg border border-border bg-bg px-3 py-2 text-center">
      <div className={cn('text-[20px] font-bold tabular-nums', toneMap[tone])}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
