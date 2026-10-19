import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { mitigations } from '../data/mockData';

export type ViewId =
  | 'overview'
  | 'graph'
  | 'findings'
  | 'paths'
  | 'reasoning'
  | 'reports';

export const ANALYSIS_STAGES = [
  'Normalize input evidence',
  'Build the environment graph',
  'Enumerate candidate paths',
  'Apply deterministic constraints',
  'Generate simulated LLM explanations',
  'Rank paths and prepare the report',
] as const;

export type AnalysisStatus = 'idle' | 'running' | 'done';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

interface AppState {
  view: ViewId;
  selectedPathId: string | null;
  selectedNodeId: string | null;
  appliedMitigations: string[];
  analysisStatus: AnalysisStatus;
  analysisStage: number; // 0..ANALYSIS_STAGES.length
  demoVersion: number; // bump → remount pages (resets local filters)
  /** entity id requested from global search, consumed by the graph page */
  focusEntityId: string | null;
}

type Action =
  | { type: 'SET_VIEW'; view: ViewId }
  | { type: 'SELECT_PATH'; id: string | null }
  | { type: 'SELECT_NODE'; id: string | null }
  | { type: 'TOGGLE_MITIGATION'; id: string }
  | { type: 'CLEAR_MITIGATIONS' }
  | { type: 'ANALYSIS_START' }
  | { type: 'ANALYSIS_STAGE'; stage: number }
  | { type: 'ANALYSIS_DONE' }
  | { type: 'FOCUS_ENTITY'; id: string | null }
  | { type: 'RESET_DEMO' };

const initialState: AppState = {
  view: 'overview',
  selectedPathId: null,
  selectedNodeId: null,
  appliedMitigations: [],
  analysisStatus: 'idle',
  analysisStage: 0,
  demoVersion: 0,
  focusEntityId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'SELECT_PATH':
      return { ...state, selectedPathId: action.id };
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.id };
    case 'TOGGLE_MITIGATION': {
      const on = state.appliedMitigations.includes(action.id);
      return {
        ...state,
        appliedMitigations: on
          ? state.appliedMitigations.filter((m) => m !== action.id)
          : [...state.appliedMitigations, action.id],
      };
    }
    case 'CLEAR_MITIGATIONS':
      return { ...state, appliedMitigations: [] };
    case 'ANALYSIS_START':
      return { ...state, analysisStatus: 'running', analysisStage: 0 };
    case 'ANALYSIS_STAGE':
      return { ...state, analysisStage: action.stage };
    case 'ANALYSIS_DONE':
      return {
        ...state,
        analysisStatus: 'done',
        analysisStage: ANALYSIS_STAGES.length,
      };
    case 'FOCUS_ENTITY':
      return { ...state, focusEntityId: action.id };
    case 'RESET_DEMO':
      return {
        ...initialState,
        view: state.view,
        demoVersion: state.demoVersion + 1,
      };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  setView: (v: ViewId) => void;
  selectPath: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  toggleMitigation: (id: string) => void;
  clearMitigations: () => void;
  runAnalysis: () => void;
  resetDemo: () => void;
  focusEntity: (id: string | null) => void;
  consumeFocusEntity: () => void;
  // derived
  brokenEdgeIds: Set<string>;
  blockedPathIds: Set<string>;
  // toasts
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const PREF_KEY = 'chainlens:view';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(PREF_KEY);
      if (saved) return { ...init, view: saved as ViewId };
    } catch {
      /* ignore */
    }
    return init;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);
  const timers = useRef<number[]>([]);

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
    timers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // persist active view
  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, state.view);
    } catch {
      /* ignore */
    }
  }, [state.view]);

  // staged analysis runner
  const runningRef = useRef(false);
  const runAnalysis = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    dispatch({ type: 'ANALYSIS_START' });
    let stage = 0;
    const tick = () => {
      stage += 1;
      if (stage <= ANALYSIS_STAGES.length) {
        dispatch({ type: 'ANALYSIS_STAGE', stage });
        const t = window.setTimeout(tick, 680);
        timers.current.push(t);
      } else {
        dispatch({ type: 'ANALYSIS_DONE' });
        runningRef.current = false;
        pushToast('Analysis complete — 8 candidates, 5 feasible, 3 rejected.', 'success');
      }
    };
    const t0 = window.setTimeout(tick, 480);
    timers.current.push(t0);
  }, [pushToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const brokenEdgeIds = useMemo(() => {
    const set = new Set<string>();
    for (const mid of state.appliedMitigations) {
      const m = mitigations.find((x) => x.id === mid);
      m?.breaksEdgeIds.forEach((e) => set.add(e));
    }
    return set;
  }, [state.appliedMitigations]);

  const blockedPathIds = useMemo(() => {
    const set = new Set<string>();
    for (const mid of state.appliedMitigations) {
      const m = mitigations.find((x) => x.id === mid);
      m?.blocksPathIds.forEach((p) => set.add(p));
    }
    return set;
  }, [state.appliedMitigations]);

  const value: AppContextValue = {
    ...state,
    setView: (v) => dispatch({ type: 'SET_VIEW', view: v }),
    selectPath: (id) => dispatch({ type: 'SELECT_PATH', id }),
    selectNode: (id) => dispatch({ type: 'SELECT_NODE', id }),
    toggleMitigation: (id) => dispatch({ type: 'TOGGLE_MITIGATION', id }),
    clearMitigations: () => dispatch({ type: 'CLEAR_MITIGATIONS' }),
    runAnalysis,
    resetDemo: () => {
      dispatch({ type: 'RESET_DEMO' });
      pushToast('Demo reset — initial data, filters, and mitigations restored.', 'info');
    },
    focusEntity: (id) => dispatch({ type: 'FOCUS_ENTITY', id }),
    consumeFocusEntity: () => dispatch({ type: 'FOCUS_ENTITY', id: null }),
    brokenEdgeIds,
    blockedPathIds,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
