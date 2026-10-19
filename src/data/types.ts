// CHAINLENS — shared domain types for the laboratory demonstration dataset.
// Everything the UI renders derives from these structures so counts, scores,
// and relationships stay consistent across every screen.

export type ZoneId =
  | 'zone-external'
  | 'zone-dmz'
  | 'zone-app'
  | 'zone-internal'
  | 'zone-mgmt';

export interface TrustZone {
  id: ZoneId;
  name: string;
  short: string;
  description: string;
  /** relative sensitivity, used only for ordering / labels, not a metric */
  order: number;
}

export type EntityType =
  | 'asset'
  | 'identity'
  | 'privilege'
  | 'finding'
  | 'dependency';

export interface Asset {
  id: string; // AS-xx
  type: 'asset';
  name: string;
  kind: string; // e.g. "Web service", "Datastore"
  zone: ZoneId;
  ip?: string;
  host?: string;
  description: string;
  confidence: Confidence;
  uncertainty?: string;
}

export interface Identity {
  id: string; // ID-xx
  type: 'identity';
  name: string;
  principal: string; // monospace principal / account id
  zone: ZoneId;
  description: string;
  confidence: Confidence;
  uncertainty?: string;
}

export interface Privilege {
  id: string; // PR-xx
  type: 'privilege';
  name: string;
  scope: string; // monospace scope token
  zone: ZoneId;
  description: string;
  confidence: Confidence;
}

export interface Dependency {
  id: string; // DEP-xx
  type: 'dependency';
  name: string;
  version: string;
  zone: ZoneId;
  description: string;
  confidence: Confidence;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Confidence = 'low' | 'moderate' | 'high';
export type ConfirmationStatus = 'confirmed' | 'inferred' | 'assumed';

export type EvidenceSource =
  | 'SAST'
  | 'SCA'
  | 'DAST'
  | 'Asset inventory'
  | 'Identity & access export'
  | 'Configuration scan'
  | 'Manual verification';

export interface Finding {
  id: string; // VF-xx
  type: 'finding';
  title: string;
  assetId: string;
  source: EvidenceSource;
  severity: Severity;
  status: ConfirmationStatus;
  confidence: Confidence;
  lastObserved: string; // ISO date
  description: string; // plain language
  evidenceExcerpt: string; // mock excerpt
  sourceRef: string; // e.g. tool run id
  preconditions: string[];
  relatedEntityIds: string[];
  confidenceExplanation: string;
  relatedPathIds: string[];
}

export type EdgeKind =
  | 'can-reach'
  | 'authenticates-as'
  | 'has-privilege'
  | 'depends-on'
  | 'finding-affects';

export interface GraphEdge {
  id: string; // E-xx
  source: string;
  target: string;
  kind: EdgeKind;
  label: string;
  /** inferred edges can be toggled off; confirmed ones are observed facts */
  inferred: boolean;
  note?: string;
}

export type FeasibilityStatus = 'feasible' | 'conditional' | 'rejected';
export type Likelihood = 'low' | 'moderate' | 'elevated';

export type DeterministicCheckId =
  | 'network-reachability'
  | 'required-identity'
  | 'required-privilege'
  | 'dependency-compatibility'
  | 'trust-boundary-policy'
  | 'preconditions';

export type CheckResult = 'pass' | 'fail' | 'n/a';

export interface DeterministicCheck {
  id: DeterministicCheckId;
  label: string;
  result: CheckResult;
  detail: string;
}

export type StepNature = 'confirmed' | 'inferred' | 'assumed';

export interface PathStep {
  order: number;
  title: string;
  nature: StepNature;
  fromEntityId?: string;
  toEntityId?: string;
  edgeId?: string;
  description: string;
  findingIds: string[];
  identityTransition?: string;
  privilegeTransition?: string;
  boundaryCrossing?: BoundaryCrossing;
}

export interface BoundaryCrossing {
  fromZone: ZoneId;
  toZone: ZoneId;
  allowedRelationship: string; // network relationship permitted
  requiredIdentityOrPrivilege: string;
}

export interface AttackPath {
  id: string; // AP-xx
  title: string;
  scenario: string; // short scenario outline
  startingAccess: string;
  startEntityId: string;
  targetAssetId: string;
  nodeIds: string[]; // nodes highlighted for this path
  edgeIds: string[]; // edges traversed by this path
  zonesCrossed: ZoneId[];
  impact: number; // 1..5 (illustrative)
  effort: number; // 1..5 (illustrative; higher = harder)
  likelihood: Likelihood;
  evidenceConfidence: Confidence;
  feasibility: FeasibilityStatus;
  steps: PathStep[];
  checks: DeterministicCheck[];
  llm: LlmAssessment;
  preconditions: string[];
  missingEvidence: string[];
  mitigations: string[]; // MIT-xx that defend this path
  rejectionReason?: string;
}

export interface LlmAssessment {
  feasibilityExplanation: string;
  contextualAssumptions: string[];
  estimatedEffort: string;
  estimatedImpact: string;
  likelihoodRationale: string;
  rankingRationale: string;
  defensiveMitigations: string[];
  agreement: 'agreement' | 'needs-review' | 'rejected';
}

export interface Mitigation {
  id: string; // MIT-xx
  label: string;
  category:
    | 'Remove permission'
    | 'Restrict network'
    | 'Separate identity'
    | 'Restrict config access'
    | 'Harden dependency';
  description: string;
  breaksEdgeIds: string[];
  blocksPathIds: string[];
}

export interface ActivityItem {
  id: string;
  time: string;
  label: string;
  detail: string;
  kind: 'ingest' | 'graph' | 'enumerate' | 'validate' | 'llm' | 'report';
}
