import {
  Server,
  Database,
  Globe,
  Shield,
  GitBranch,
  Cog,
  HardDrive,
  FileText,
  KeyRound,
  UserRound,
  Boxes,
  ShieldCheck,
  Network,
  type LucideIcon,
} from 'lucide-react';
import type { EntityType, EdgeKind } from '../data/types';

/** Icon chosen per asset by id, falling back to a generic per-type icon. */
const assetIcons: Record<string, LucideIcon> = {
  'AS-01': Globe,
  'AS-02': Network,
  'AS-03': Server,
  'AS-04': Cog,
  'AS-05': GitBranch,
  'AS-06': Boxes,
  'AS-07': HardDrive,
  'AS-08': FileText,
  'AS-09': Database,
  'AS-10': HardDrive,
  'AS-11': ShieldCheck,
  'AS-12': Shield,
};

export function iconForEntity(type: EntityType, id: string): LucideIcon {
  switch (type) {
    case 'asset':
      return assetIcons[id] ?? Server;
    case 'identity':
      return UserRound;
    case 'privilege':
      return KeyRound;
    case 'dependency':
      return Boxes;
    case 'finding':
      return FileText;
    default:
      return Server;
  }
}

export const entityTypeLabel: Record<EntityType, string> = {
  asset: 'Asset',
  identity: 'Identity',
  privilege: 'Privilege',
  dependency: 'Dependency',
  finding: 'Finding',
};

/** Accent color token per entity type (used for node borders/badges). */
export const entityTypeColor: Record<EntityType, string> = {
  asset: 'var(--color-cyan)',
  identity: 'var(--color-violet)',
  privilege: 'var(--color-warning)',
  dependency: 'var(--color-info)',
  finding: 'var(--color-critical)',
};

export const edgeKindLabel: Record<EdgeKind, string> = {
  'can-reach': 'Can reach',
  'authenticates-as': 'Authenticates as',
  'has-privilege': 'Has privilege',
  'depends-on': 'Depends on',
  'finding-affects': 'Finding affects',
};

export const edgeKindColor: Record<EdgeKind, string> = {
  'can-reach': '#4b5e7e',
  'authenticates-as': '#a78bfa',
  'has-privilege': '#fbbf24',
  'depends-on': '#38bdf8',
  'finding-affects': '#fb7185',
};
