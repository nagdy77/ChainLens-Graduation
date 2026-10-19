import type { ZoneId, EntityType } from '../../data/types';
import { assets, identities, privileges, dependencies, zones } from '../../data/mockData';

export const NODE_W = 178;
export const NODE_H = 56;

export interface GraphEntityRef {
  id: string;
  type: EntityType;
  zone: ZoneId;
  x: number;
  y: number;
}

// Hand-tuned positions for a clean, legible left→right layout by trust zone.
export const NODE_POS: Record<string, { x: number; y: number }> = {
  // External
  'AS-01': { x: 40, y: 170 },
  'ID-01': { x: 40, y: 300 },

  // DMZ
  'AS-02': { x: 310, y: 230 },

  // Application
  'AS-03': { x: 580, y: 110 },
  'AS-06': { x: 580, y: 300 },
  'AS-05': { x: 580, y: 430 },
  'DEP-01': { x: 580, y: 560 },
  'AS-04': { x: 800, y: 110 },
  'ID-02': { x: 800, y: 235 },
  'ID-03': { x: 800, y: 360 },
  'PR-01': { x: 800, y: 485 },

  // Internal Services
  'AS-08': { x: 1090, y: 110 },
  'AS-09': { x: 1090, y: 245 },
  'AS-07': { x: 1090, y: 380 },
  'AS-10': { x: 1090, y: 515 },
  'DEP-02': { x: 1320, y: 110 },
  'PR-02': { x: 1320, y: 245 },
  'ID-04': { x: 1320, y: 380 },
  'PR-03': { x: 1320, y: 515 },

  // Management
  'AS-12': { x: 1600, y: 190 },
  'AS-11': { x: 1600, y: 320 },
};

export function allGraphEntities(): GraphEntityRef[] {
  const refs: GraphEntityRef[] = [];
  const push = (id: string, type: EntityType, zone: ZoneId) => {
    const p = NODE_POS[id];
    if (p) refs.push({ id, type, zone, x: p.x, y: p.y });
  };
  assets.forEach((a) => push(a.id, 'asset', a.zone));
  identities.forEach((i) => push(i.id, 'identity', i.zone));
  privileges.forEach((p) => push(p.id, 'privilege', p.zone));
  dependencies.forEach((d) => push(d.id, 'dependency', d.zone));
  return refs;
}

export interface ZoneRect {
  id: ZoneId;
  name: string;
  short: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const ZONE_PAD_X = 26;
const ZONE_PAD_TOP = 48;
const ZONE_PAD_BOTTOM = 24;

/** Compute a bounding rectangle for each zone from its member nodes. */
export function zoneRects(entities: GraphEntityRef[]): ZoneRect[] {
  return zones
    .map((z) => {
      const members = entities.filter((e) => e.zone === z.id);
      if (!members.length) return null;
      const minX = Math.min(...members.map((m) => m.x));
      const maxX = Math.max(...members.map((m) => m.x + NODE_W));
      const minY = Math.min(...members.map((m) => m.y));
      const maxY = Math.max(...members.map((m) => m.y + NODE_H));
      return {
        id: z.id,
        name: z.name,
        short: z.short,
        x: minX - ZONE_PAD_X,
        y: minY - ZONE_PAD_TOP,
        w: maxX - minX + ZONE_PAD_X * 2,
        h: maxY - minY + ZONE_PAD_TOP + ZONE_PAD_BOTTOM,
      } satisfies ZoneRect;
    })
    .filter((r): r is ZoneRect => r !== null);
}

export const zoneTint: Record<ZoneId, { fill: string; border: string; text: string }> = {
  'zone-external': { fill: 'rgba(251,113,133,0.05)', border: 'rgba(251,113,133,0.28)', text: '#fb7185' },
  'zone-dmz': { fill: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.28)', text: '#fbbf24' },
  'zone-app': { fill: 'rgba(34,211,238,0.05)', border: 'rgba(34,211,238,0.26)', text: '#22d3ee' },
  'zone-internal': { fill: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.28)', text: '#a78bfa' },
  'zone-mgmt': { fill: 'rgba(52,211,153,0.05)', border: 'rgba(52,211,153,0.28)', text: '#34d399' },
};
