// CHAINLENS — laboratory demonstration dataset (single source of truth).
//
// This is predefined, fictional data for a graduation-project prototype.
// It represents CONFIRMED observations (findings/assets) and INFERRED
// possibilities (attack paths). Nothing here is a measured research result,
// and no path contains exploit code, payloads, or operational instructions —
// the focus is defensive interpretation only.

import type {
  Asset,
  Identity,
  Privilege,
  Dependency,
  Finding,
  GraphEdge,
  AttackPath,
  Mitigation,
  TrustZone,
  ActivityItem,
} from './types';

export const ENVIRONMENT_NAME = 'Graduation Lab';
export const ENVIRONMENT_STATUS = 'Snapshot loaded · 2026-10-12';

/* ------------------------------------------------------------------ */
/* Trust zones                                                         */
/* ------------------------------------------------------------------ */
export const zones: TrustZone[] = [
  {
    id: 'zone-external',
    name: 'External',
    short: 'EXT',
    description: 'Untrusted internet-facing surface and anonymous visitors.',
    order: 0,
  },
  {
    id: 'zone-dmz',
    name: 'DMZ',
    short: 'DMZ',
    description: 'Edge services that terminate and forward external traffic.',
    order: 1,
  },
  {
    id: 'zone-app',
    name: 'Application',
    short: 'APP',
    description: 'Core application compute, build, and configuration services.',
    order: 2,
  },
  {
    id: 'zone-internal',
    name: 'Internal Services',
    short: 'INT',
    description: 'Data stores and internal processing not exposed externally.',
    order: 3,
  },
  {
    id: 'zone-mgmt',
    name: 'Management',
    short: 'MGMT',
    description: 'Identity and administrative control plane.',
    order: 4,
  },
];

/* ------------------------------------------------------------------ */
/* Assets (12)                                                         */
/* ------------------------------------------------------------------ */
export const assets: Asset[] = [
  {
    id: 'AS-01',
    type: 'asset',
    name: 'Public Web Portal',
    kind: 'Web application',
    zone: 'zone-external',
    ip: '203.0.113.10',
    host: 'portal.lab.example',
    description: 'Customer-facing web portal reachable from the public internet.',
    confidence: 'high',
  },
  {
    id: 'AS-02',
    type: 'asset',
    name: 'Reverse Proxy',
    kind: 'Edge gateway',
    zone: 'zone-dmz',
    ip: '10.20.0.5',
    host: 'edge-proxy-01',
    description: 'Terminates TLS and forwards requests to the application tier.',
    confidence: 'high',
  },
  {
    id: 'AS-03',
    type: 'asset',
    name: 'Application API',
    kind: 'Service',
    zone: 'zone-app',
    ip: '10.30.1.12',
    host: 'app-api-01',
    description: 'Primary business API consumed by the portal.',
    confidence: 'high',
  },
  {
    id: 'AS-04',
    type: 'asset',
    name: 'Background Worker',
    kind: 'Service',
    zone: 'zone-app',
    ip: '10.30.1.20',
    host: 'worker-01',
    description: 'Asynchronous job processor; renders reports from templates.',
    confidence: 'high',
  },
  {
    id: 'AS-05',
    type: 'asset',
    name: 'Configuration Repository',
    kind: 'Source repository',
    zone: 'zone-app',
    host: 'git.lab.example/app-config',
    description: 'Git repository holding application and deployment configuration.',
    confidence: 'high',
    uncertainty: 'Access history before the snapshot window is not available.',
  },
  {
    id: 'AS-06',
    type: 'asset',
    name: 'CI Runner',
    kind: 'Build agent',
    zone: 'zone-app',
    ip: '10.30.2.8',
    host: 'ci-runner-01',
    description: 'Continuous-integration agent that builds and deploys the API.',
    confidence: 'high',
  },
  {
    id: 'AS-07',
    type: 'asset',
    name: 'Internal File Share',
    kind: 'File server',
    zone: 'zone-internal',
    ip: '10.40.0.9',
    host: 'files-01',
    description: 'SMB share for internal documents and staging data.',
    confidence: 'high',
  },
  {
    id: 'AS-08',
    type: 'asset',
    name: 'Reporting Service',
    kind: 'Service',
    zone: 'zone-internal',
    ip: '10.40.1.4',
    host: 'reporting-01',
    description: 'Generates internal business reports; publishes shared templates.',
    confidence: 'high',
  },
  {
    id: 'AS-09',
    type: 'asset',
    name: 'Customer Database',
    kind: 'Datastore',
    zone: 'zone-internal',
    ip: '10.40.2.2',
    host: 'db-customers-01',
    description: 'Relational store of customer records (sensitive data).',
    confidence: 'high',
  },
  {
    id: 'AS-10',
    type: 'asset',
    name: 'Backup Service',
    kind: 'Datastore',
    zone: 'zone-internal',
    ip: '10.40.3.6',
    host: 'backup-01',
    description: 'Stores periodic backups, including database and share snapshots.',
    confidence: 'high',
  },
  {
    id: 'AS-11',
    type: 'asset',
    name: 'Identity Provider',
    kind: 'Control plane',
    zone: 'zone-mgmt',
    ip: '10.50.0.3',
    host: 'idp-01',
    description: 'Issues tokens and manages accounts and roles.',
    confidence: 'high',
  },
  {
    id: 'AS-12',
    type: 'asset',
    name: 'Management Console',
    kind: 'Control plane',
    zone: 'zone-mgmt',
    ip: '10.50.0.9',
    host: 'mgmt-console-01',
    description: 'Administrative console for infrastructure and identity.',
    confidence: 'high',
  },
];

/* ------------------------------------------------------------------ */
/* Identities (4)                                                      */
/* ------------------------------------------------------------------ */
export const identities: Identity[] = [
  {
    id: 'ID-01',
    type: 'identity',
    name: 'Guest User',
    principal: 'anonymous@portal',
    zone: 'zone-external',
    description: 'Unauthenticated visitor to the public portal.',
    confidence: 'high',
  },
  {
    id: 'ID-02',
    type: 'identity',
    name: 'Application Service Account',
    principal: 'svc-app@lab.example',
    zone: 'zone-app',
    description:
      'Service account used by the Application API and Reporting Service.',
    confidence: 'high',
    uncertainty:
      'Shared across two services; exact credential rotation date unknown.',
  },
  {
    id: 'ID-03',
    type: 'identity',
    name: 'CI Service Account',
    principal: 'svc-ci@lab.example',
    zone: 'zone-app',
    description: 'Automation account used by the CI runner for deployments.',
    confidence: 'high',
  },
  {
    id: 'ID-04',
    type: 'identity',
    name: 'Support Analyst',
    principal: 'a.analyst@lab.example',
    zone: 'zone-internal',
    description: 'Human support role with internal file-share access.',
    confidence: 'high',
  },
];

/* ------------------------------------------------------------------ */
/* Privilege roles (3)                                                 */
/* ------------------------------------------------------------------ */
export const privileges: Privilege[] = [
  {
    id: 'PR-01',
    type: 'privilege',
    name: 'Deploy & Config Write',
    scope: 'deploy:app-api, write:app-config',
    zone: 'zone-app',
    description: 'Can deploy the Application API and write to configuration.',
    confidence: 'high',
  },
  {
    id: 'PR-02',
    type: 'privilege',
    name: 'Broad Database Read',
    scope: 'read:customers.*',
    zone: 'zone-internal',
    description: 'Read access across all customer database schemas.',
    confidence: 'high',
  },
  {
    id: 'PR-03',
    type: 'privilege',
    name: 'File Share Full Access',
    scope: 'rw:files/*, read:backup-staging',
    zone: 'zone-internal',
    description: 'Full read/write on the internal share and backup staging.',
    confidence: 'high',
  },
];

/* ------------------------------------------------------------------ */
/* Application dependencies                                            */
/* ------------------------------------------------------------------ */
export const dependencies: Dependency[] = [
  {
    id: 'DEP-01',
    type: 'dependency',
    name: 'shared-auth-lib',
    version: '2.3.1',
    zone: 'zone-app',
    description: 'Shared authentication helper used by the API and reporting.',
    confidence: 'high',
  },
  {
    id: 'DEP-02',
    type: 'dependency',
    name: 'report-templates',
    version: '1.7.0',
    zone: 'zone-internal',
    description:
      'Shared report-template package published by the Reporting Service and consumed by the Background Worker.',
    confidence: 'high',
  },
];

/* ------------------------------------------------------------------ */
/* Findings (10) — primarily low, a few medium                         */
/* ------------------------------------------------------------------ */
export const findings: Finding[] = [
  {
    id: 'VF-01',
    type: 'finding',
    title: 'Configuration context exposed on public portal',
    assetId: 'AS-01',
    source: 'DAST',
    severity: 'medium',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-11',
    description:
      'A diagnostics endpoint on the public portal returns application configuration context, including references to internal service names and a shared credential key path.',
    evidenceExcerpt:
      'GET /internal/diag/config → 200\n{ "service_account_ref": "vault://app-config/svc-app", "reporting_url": "http://reporting-01:8080" }',
    sourceRef: 'DAST scan run #DS-2291',
    preconditions: ['Network access to the public portal (always available).'],
    relatedEntityIds: ['AS-01', 'AS-03', 'ID-02'],
    confidenceExplanation:
      'Reproduced across two scan runs and confirmed manually; response is deterministic.',
    relatedPathIds: ['AP-01', 'AP-06'],
  },
  {
    id: 'VF-02',
    type: 'finding',
    title: 'Verbose error messages disclose internal routing',
    assetId: 'AS-03',
    source: 'DAST',
    severity: 'low',
    status: 'confirmed',
    confidence: 'moderate',
    lastObserved: '2026-10-11',
    description:
      'Unhandled errors in the Application API return stack traces that reveal internal hostnames and the reporting service endpoint.',
    evidenceExcerpt:
      'HTTP 500 → "connect ECONNREFUSED reporting-01:8080 (ReportClient.fetch)"',
    sourceRef: 'DAST scan run #DS-2291',
    preconditions: ['Ability to trigger an error path in the API.'],
    relatedEntityIds: ['AS-03', 'AS-08'],
    confidenceExplanation:
      'Observed intermittently; depends on which error path is triggered.',
    relatedPathIds: ['AP-01'],
  },
  {
    id: 'VF-03',
    type: 'finding',
    title: 'Shared service credential stored in configuration repository',
    assetId: 'AS-05',
    source: 'SAST',
    severity: 'medium',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-10',
    description:
      'The configuration repository contains a long-lived credential for the shared Application Service Account, reused by multiple services.',
    evidenceExcerpt:
      'app-config/deploy.env:14  SVC_APP_TOKEN=**** (shared: app-api, reporting)',
    sourceRef: 'SAST rule SECRETS-014 · manual verification MV-07',
    preconditions: ['Read access to the configuration repository.'],
    relatedEntityIds: ['AS-05', 'ID-02'],
    confidenceExplanation:
      'Secret pattern confirmed by SAST and verified manually against the running service.',
    relatedPathIds: ['AP-01', 'AP-02'],
  },
  {
    id: 'VF-04',
    type: 'finding',
    title: 'Over-permissive CI service account',
    assetId: 'AS-06',
    source: 'Identity & access export',
    severity: 'low',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-09',
    description:
      'The CI service account holds deploy and configuration-write privileges broader than its build role requires.',
    evidenceExcerpt:
      'iam-export.json  principal=svc-ci  roles=[deploy:app-api, write:app-config]',
    sourceRef: 'IAM export IAM-2026-41',
    preconditions: ['Control of a CI job on the runner.'],
    relatedEntityIds: ['AS-06', 'ID-03', 'PR-01'],
    confidenceExplanation:
      'Directly read from the identity export; role bindings are authoritative.',
    relatedPathIds: ['AP-02'],
  },
  {
    id: 'VF-05',
    type: 'finding',
    title: 'Excessive file-share permissions for support role',
    assetId: 'AS-07',
    source: 'Configuration scan',
    severity: 'low',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-10',
    description:
      'The Support Analyst role is granted full read/write on the internal file share, including backup-staging folders unrelated to support tasks.',
    evidenceExcerpt:
      'acl: files/* → a.analyst (rwx); files/backup-staging → a.analyst (r)',
    sourceRef: 'Config scan CS-118',
    preconditions: ['Authenticated Support Analyst session.'],
    relatedEntityIds: ['AS-07', 'ID-04', 'PR-03'],
    confidenceExplanation:
      'ACL read directly from the share configuration export.',
    relatedPathIds: ['AP-03'],
  },
  {
    id: 'VF-06',
    type: 'finding',
    title: 'Backup service readable by file-share identity',
    assetId: 'AS-10',
    source: 'Configuration scan',
    severity: 'low',
    status: 'confirmed',
    confidence: 'moderate',
    lastObserved: '2026-10-10',
    description:
      'Backup snapshots are readable by identities that already hold file-share access, widening exposure of sensitive data.',
    evidenceExcerpt: 'backup-01 policy: allow read where group in (files-users)',
    sourceRef: 'Config scan CS-119',
    preconditions: ['File-share read access (see VF-05).'],
    relatedEntityIds: ['AS-10', 'AS-07'],
    confidenceExplanation:
      'Policy observed in configuration; effective access not exercised in the lab.',
    relatedPathIds: ['AP-03'],
  },
  {
    id: 'VF-07',
    type: 'finding',
    title: 'Application service account has broad database read',
    assetId: 'AS-09',
    source: 'Identity & access export',
    severity: 'medium',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-09',
    description:
      'The shared Application Service Account can read all customer database schemas, exceeding the data the API needs.',
    evidenceExcerpt: 'iam-export.json  principal=svc-app  grant=read:customers.*',
    sourceRef: 'IAM export IAM-2026-41',
    preconditions: ['Ability to act as the Application Service Account.'],
    relatedEntityIds: ['AS-09', 'ID-02', 'PR-02'],
    confidenceExplanation:
      'Grant read directly from the identity export; scope is explicit.',
    relatedPathIds: ['AP-04'],
  },
  {
    id: 'VF-08',
    type: 'finding',
    title: 'Outdated shared dependency in Reporting Service',
    assetId: 'AS-08',
    source: 'SCA',
    severity: 'low',
    status: 'confirmed',
    confidence: 'moderate',
    lastObserved: '2026-10-08',
    description:
      'The Reporting Service pins an older build metadata of a shared library. The installed version is current enough that known issues do not apply, but it is flagged for hygiene.',
    evidenceExcerpt: 'sca-report: shared-auth-lib@2.3.1 (advisory applies < 2.0.0 — not affected)',
    sourceRef: 'SCA run SCA-77',
    preconditions: ['None (informational hygiene finding).'],
    relatedEntityIds: ['AS-08', 'DEP-01'],
    confidenceExplanation:
      'Version resolved from the lockfile; advisory range does not include the installed version.',
    relatedPathIds: ['AP-08'],
  },
  {
    id: 'VF-09',
    type: 'finding',
    title: 'Writable shared dependency published by Reporting Service',
    assetId: 'AS-08',
    source: 'Manual verification',
    severity: 'low',
    status: 'confirmed',
    confidence: 'moderate',
    lastObserved: '2026-10-10',
    description:
      'The Reporting Service can write to the shared report-templates package that other services consume, creating a cross-service integrity dependency.',
    evidenceExcerpt:
      'registry acl: report-templates → write: svc-app (via reporting-01)',
    sourceRef: 'Manual verification MV-09',
    preconditions: ['Ability to act via the Reporting Service identity.'],
    relatedEntityIds: ['AS-08', 'DEP-02', 'AS-04'],
    confidenceExplanation:
      'Write capability confirmed manually; downstream execution not exercised.',
    relatedPathIds: ['AP-05'],
  },
  {
    id: 'VF-10',
    type: 'finding',
    title: 'Unnecessary network reachability to customer database',
    assetId: 'AS-03',
    source: 'Asset inventory',
    severity: 'low',
    status: 'confirmed',
    confidence: 'high',
    lastObserved: '2026-10-07',
    description:
      'Network inventory shows the Application API can reach the Customer Database directly on the database port, beyond what its queries require.',
    evidenceExcerpt: 'netmap: app-api-01 → db-customers-01:5432 ALLOW (unused route)',
    sourceRef: 'Asset inventory INV-2026-33',
    preconditions: ['Position on the Application API host.'],
    relatedEntityIds: ['AS-03', 'AS-09'],
    confidenceExplanation:
      'Route observed in the network inventory snapshot.',
    relatedPathIds: ['AP-04'],
  },
];

/* ------------------------------------------------------------------ */
/* Graph edges                                                         */
/* ------------------------------------------------------------------ */
export const edges: GraphEdge[] = [
  // can-reach (network)
  { id: 'E-01', source: 'AS-01', target: 'AS-02', kind: 'can-reach', label: 'HTTPS 443', inferred: false },
  { id: 'E-02', source: 'AS-02', target: 'AS-03', kind: 'can-reach', label: 'proxy pass', inferred: false },
  { id: 'E-03', source: 'AS-03', target: 'AS-04', kind: 'can-reach', label: 'task queue', inferred: false },
  { id: 'E-04', source: 'AS-03', target: 'AS-09', kind: 'can-reach', label: 'db 5432 (unused route)', inferred: false, note: 'Flagged by VF-10 as unnecessary.' },
  { id: 'E-05', source: 'AS-03', target: 'AS-08', kind: 'can-reach', label: 'internal http', inferred: false },
  { id: 'E-06', source: 'AS-04', target: 'AS-07', kind: 'can-reach', label: 'SMB', inferred: false },
  { id: 'E-07', source: 'AS-06', target: 'AS-05', kind: 'can-reach', label: 'git read/write', inferred: false },
  { id: 'E-08', source: 'AS-06', target: 'AS-03', kind: 'can-reach', label: 'deploy', inferred: false },
  { id: 'E-09', source: 'AS-08', target: 'AS-07', kind: 'can-reach', label: 'reads templates', inferred: false },
  { id: 'E-11', source: 'AS-07', target: 'AS-10', kind: 'can-reach', label: 'backup sync', inferred: false },
  { id: 'E-12', source: 'AS-12', target: 'AS-11', kind: 'can-reach', label: 'admin API', inferred: false },
  { id: 'E-14', source: 'AS-03', target: 'AS-11', kind: 'can-reach', label: 'OIDC', inferred: false },

  // authenticates-as
  { id: 'E-20', source: 'AS-01', target: 'ID-01', kind: 'authenticates-as', label: 'anonymous', inferred: false },
  { id: 'E-21', source: 'AS-03', target: 'ID-02', kind: 'authenticates-as', label: 'service login', inferred: false },
  { id: 'E-22', source: 'AS-06', target: 'ID-03', kind: 'authenticates-as', label: 'service login', inferred: false },
  { id: 'E-23', source: 'AS-05', target: 'ID-02', kind: 'authenticates-as', label: 'stored shared credential', inferred: true, note: 'Inferred reuse of the shared service identity (VF-03).' },
  { id: 'E-24', source: 'AS-12', target: 'ID-04', kind: 'authenticates-as', label: 'console login', inferred: false },

  // has-privilege
  { id: 'E-30', source: 'ID-02', target: 'PR-02', kind: 'has-privilege', label: 'holds', inferred: false },
  { id: 'E-31', source: 'ID-03', target: 'PR-01', kind: 'has-privilege', label: 'holds', inferred: false },
  { id: 'E-32', source: 'ID-04', target: 'PR-03', kind: 'has-privilege', label: 'holds', inferred: false },

  // privilege grants (privilege → asset)
  { id: 'E-50', source: 'PR-02', target: 'AS-09', kind: 'has-privilege', label: 'grants read', inferred: false },
  { id: 'E-51', source: 'PR-01', target: 'AS-05', kind: 'has-privilege', label: 'grants write', inferred: false },
  { id: 'E-52', source: 'PR-01', target: 'AS-03', kind: 'has-privilege', label: 'grants deploy', inferred: false },
  { id: 'E-53', source: 'PR-03', target: 'AS-07', kind: 'has-privilege', label: 'grants access', inferred: false },
  { id: 'E-54', source: 'PR-03', target: 'AS-10', kind: 'has-privilege', label: 'grants read', inferred: true, note: 'Inferred effective access via backup policy (VF-06).' },

  // depends-on
  { id: 'E-40', source: 'AS-03', target: 'DEP-01', kind: 'depends-on', label: 'uses', inferred: false },
  { id: 'E-41', source: 'AS-08', target: 'DEP-01', kind: 'depends-on', label: 'uses', inferred: false },
  { id: 'E-42', source: 'AS-04', target: 'DEP-02', kind: 'depends-on', label: 'consumes', inferred: false },
  { id: 'E-43', source: 'AS-08', target: 'DEP-02', kind: 'depends-on', label: 'publishes/writes', inferred: false, note: 'Writable by reporting identity (VF-09).' },
];

/* ------------------------------------------------------------------ */
/* Mitigations                                                         */
/* ------------------------------------------------------------------ */
export const mitigations: Mitigation[] = [
  {
    id: 'MIT-01',
    label: 'Remove broad database read from Application Service Account',
    category: 'Remove permission',
    description:
      'Scope svc-app down to the specific tables the API needs instead of read:customers.*.',
    breaksEdgeIds: ['E-30', 'E-50'],
    blocksPathIds: ['AP-04'],
  },
  {
    id: 'MIT-02',
    label: 'Restrict Application API → Customer Database reachability',
    category: 'Restrict network',
    description:
      'Remove the unused direct route from app-api-01 to db-customers-01:5432.',
    breaksEdgeIds: ['E-04'],
    blocksPathIds: ['AP-04'],
  },
  {
    id: 'MIT-03',
    label: 'Separate the shared service identity',
    category: 'Separate identity',
    description:
      'Issue distinct credentials for the API and Reporting Service so a leaked config credential cannot be reused.',
    breaksEdgeIds: ['E-23'],
    blocksPathIds: ['AP-01', 'AP-02'],
  },
  {
    id: 'MIT-04',
    label: 'Restrict configuration-file access',
    category: 'Restrict config access',
    description:
      'Limit CI read/write on the configuration repository and remove long-lived secrets from it.',
    breaksEdgeIds: ['E-07'],
    blocksPathIds: ['AP-02'],
  },
  {
    id: 'MIT-05',
    label: 'Reduce Support Analyst file-share permissions',
    category: 'Remove permission',
    description:
      'Grant least-privilege access and remove backup-staging read from the support role.',
    breaksEdgeIds: ['E-32', 'E-53'],
    blocksPathIds: ['AP-03'],
  },
  {
    id: 'MIT-06',
    label: 'Make report-templates read-only for the reporting identity',
    category: 'Harden dependency',
    description:
      'Publish shared templates through a reviewed pipeline instead of direct writes.',
    breaksEdgeIds: ['E-43'],
    blocksPathIds: ['AP-05'],
  },
];

/* ------------------------------------------------------------------ */
/* Attack paths (8): 5 feasible, 3 rejected                            */
/* ------------------------------------------------------------------ */
export const attackPaths: AttackPath[] = [
  {
    id: 'AP-01',
    title: 'Portal config exposure to internal reporting data',
    scenario:
      'Public application access → exposed configuration context → service identity access → internal reporting data.',
    startingAccess: 'Anonymous access to the public portal',
    startEntityId: 'ID-01',
    targetAssetId: 'AS-08',
    nodeIds: ['AS-01', 'AS-02', 'AS-03', 'AS-05', 'ID-02', 'AS-08'],
    edgeIds: ['E-01', 'E-02', 'E-23', 'E-05'],
    zonesCrossed: ['zone-external', 'zone-dmz', 'zone-app', 'zone-internal'],
    impact: 3,
    effort: 2,
    likelihood: 'moderate',
    evidenceConfidence: 'high',
    feasibility: 'feasible',
    preconditions: [
      'Public portal reachable (confirmed).',
      'Diagnostics endpoint still exposes config context (confirmed VF-01).',
      'Shared credential remains valid (assumed).',
    ],
    missingEvidence: [
      'No capture proving the credential was actually used post-disclosure.',
    ],
    mitigations: ['MIT-03'],
    steps: [
      {
        order: 1,
        title: 'Reach portal and read exposed configuration context',
        nature: 'confirmed',
        fromEntityId: 'AS-01',
        toEntityId: 'AS-02',
        edgeId: 'E-01',
        description:
          'The public portal exposes a diagnostics endpoint disclosing internal service references and a shared credential path.',
        findingIds: ['VF-01'],
        boundaryCrossing: {
          fromZone: 'zone-external',
          toZone: 'zone-dmz',
          allowedRelationship: 'HTTPS 443 to reverse proxy',
          requiredIdentityOrPrivilege: 'None (anonymous)',
        },
      },
      {
        order: 2,
        title: 'Recover shared service credential reference',
        nature: 'confirmed',
        description:
          'The disclosed configuration points to the shared Application Service Account credential stored in the config repository.',
        findingIds: ['VF-01', 'VF-03'],
      },
      {
        order: 3,
        title: 'Reuse shared Application Service Account identity',
        nature: 'inferred',
        toEntityId: 'ID-02',
        edgeId: 'E-23',
        description:
          'The leaked shared credential is reused to act as the Application Service Account.',
        findingIds: ['VF-03'],
        identityTransition: 'Guest User → Application Service Account',
      },
      {
        order: 4,
        title: 'Read internal reporting data',
        nature: 'inferred',
        fromEntityId: 'AS-03',
        toEntityId: 'AS-08',
        edgeId: 'E-05',
        description:
          'Using application reachability, the actor queries internal reporting data.',
        findingIds: ['VF-02'],
        boundaryCrossing: {
          fromZone: 'zone-app',
          toZone: 'zone-internal',
          allowedRelationship: 'Internal HTTP app-api → reporting',
          requiredIdentityOrPrivilege: 'Application Service Account',
        },
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'Portal → proxy → API → reporting edges all present in the inventory.' },
      { id: 'required-identity', label: 'Required identity', result: 'pass', detail: 'Shared Application Service Account credential is disclosed and valid in the snapshot.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'pass', detail: 'Service account can read the reporting service.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'No dependency step in this path.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'pass', detail: 'Each crossing has an allowed network relationship and a satisfied identity requirement.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'pass', detail: 'All confirmed preconditions hold; one assumption (credential validity) noted.' },
    ],
    llm: {
      feasibilityExplanation:
        'The chain is plausible: a confirmed configuration disclosure hands an attacker a shared credential that confirmed grants point at internal reporting data.',
      contextualAssumptions: [
        'The leaked credential has not been rotated since the snapshot.',
        'Reporting data is reachable with only the service account role.',
      ],
      estimatedEffort: 'Low — no custom tooling; relies on a public response and credential reuse.',
      estimatedImpact: 'Moderate — exposure of internal reporting data, not the primary customer store.',
      likelihoodRationale:
        'Entry step is trivially reachable, but success depends on the credential still being valid, so likelihood is moderate rather than elevated.',
      rankingRationale:
        'High evidence confidence and low effort keep this near the top despite moderate impact.',
      defensiveMitigations: [
        'Separate the shared service identity (MIT-03).',
        'Remove the diagnostics endpoint from the public portal.',
      ],
      agreement: 'agreement',
    },
  },
  {
    id: 'AP-02',
    title: 'CI configuration access to application modification',
    scenario:
      'CI configuration access → shared service identity → broader deployment permissions → application modification.',
    startingAccess: 'Control of a CI job on the runner',
    startEntityId: 'ID-03',
    targetAssetId: 'AS-03',
    nodeIds: ['AS-06', 'AS-05', 'ID-03', 'PR-01', 'AS-03', 'ID-02'],
    edgeIds: ['E-07', 'E-23', 'E-31', 'E-52', 'E-08'],
    zonesCrossed: ['zone-app'],
    impact: 4,
    effort: 3,
    likelihood: 'moderate',
    evidenceConfidence: 'moderate',
    feasibility: 'feasible',
    preconditions: [
      'Ability to influence a CI job (assumed insider or supply-chain foothold).',
      'CI account retains deploy & config-write (confirmed VF-04).',
    ],
    missingEvidence: [
      'No evidence of an existing foothold on the CI runner; entry is assumed.',
    ],
    mitigations: ['MIT-03', 'MIT-04'],
    steps: [
      {
        order: 1,
        title: 'Access configuration repository from CI',
        nature: 'confirmed',
        fromEntityId: 'AS-06',
        toEntityId: 'AS-05',
        edgeId: 'E-07',
        description:
          'The CI runner reads and writes the configuration repository as part of normal deployment.',
        findingIds: [],
      },
      {
        order: 2,
        title: 'Recover and reuse the shared service credential',
        nature: 'inferred',
        toEntityId: 'ID-02',
        edgeId: 'E-23',
        description:
          'The shared service credential stored in config is reused.',
        findingIds: ['VF-03'],
        identityTransition: 'CI Service Account → Application Service Account',
      },
      {
        order: 3,
        title: 'Leverage over-broad deploy & config-write privilege',
        nature: 'confirmed',
        toEntityId: 'PR-01',
        edgeId: 'E-31',
        description:
          'The CI account holds deploy and configuration-write rights beyond its build role.',
        findingIds: ['VF-04'],
        privilegeTransition: 'build-only → Deploy & Config Write',
      },
      {
        order: 4,
        title: 'Modify the deployed Application API',
        nature: 'inferred',
        toEntityId: 'AS-03',
        edgeId: 'E-08',
        description:
          'Deployment rights are used to alter the running Application API.',
        findingIds: [],
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'CI runner reaches config repo and the deploy target.' },
      { id: 'required-identity', label: 'Required identity', result: 'pass', detail: 'CI and shared service identities are both available in the snapshot.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'pass', detail: 'Deploy & Config Write is confirmed on the CI account.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'No dependency step in this path.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'pass', detail: 'All steps remain within the Application zone.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'pass', detail: 'Confirmed privileges hold; entry foothold is an assumption.' },
    ],
    llm: {
      feasibilityExplanation:
        'Given a CI foothold, confirmed over-broad privileges make application modification straightforward.',
      contextualAssumptions: [
        'An actor can influence a CI job (insider or compromised pipeline input).',
      ],
      estimatedEffort: 'Moderate — requires an initial CI foothold, then uses confirmed privileges.',
      estimatedImpact: 'High — direct modification of the production application.',
      likelihoodRationale:
        'The downstream privileges are confirmed, but the initial CI foothold is unproven, holding likelihood at moderate.',
      rankingRationale:
        'High impact raises it, but moderate evidence confidence on the entry step keeps it below the top accepted paths.',
      defensiveMitigations: [
        'Separate the shared service identity (MIT-03).',
        'Restrict CI access to configuration and remove long-lived secrets (MIT-04).',
      ],
      agreement: 'agreement',
    },
  },
  {
    id: 'AP-03',
    title: 'Support role to backup data exposure',
    scenario:
      'Low-privilege support access → excessive share permissions → backup access → sensitive data exposure.',
    startingAccess: 'Authenticated Support Analyst',
    startEntityId: 'ID-04',
    targetAssetId: 'AS-10',
    nodeIds: ['ID-04', 'PR-03', 'AS-07', 'AS-10'],
    edgeIds: ['E-32', 'E-53', 'E-11', 'E-54'],
    zonesCrossed: ['zone-internal'],
    impact: 3,
    effort: 2,
    likelihood: 'elevated',
    evidenceConfidence: 'high',
    feasibility: 'feasible',
    preconditions: [
      'Valid Support Analyst session (confirmed role).',
      'Excessive share ACL remains in place (confirmed VF-05).',
    ],
    missingEvidence: [
      'Effective read on backup archives observed in policy but not exercised in the lab.',
    ],
    mitigations: ['MIT-05'],
    steps: [
      {
        order: 1,
        title: 'Authenticate as Support Analyst with full share access',
        nature: 'confirmed',
        toEntityId: 'PR-03',
        edgeId: 'E-32',
        description:
          'The support role holds full read/write on the internal file share.',
        findingIds: ['VF-05'],
      },
      {
        order: 2,
        title: 'Browse beyond support scope into backup staging',
        nature: 'confirmed',
        fromEntityId: 'PR-03',
        toEntityId: 'AS-07',
        edgeId: 'E-53',
        description:
          'Excessive ACLs allow the role to browse backup-staging folders on the share.',
        findingIds: ['VF-05'],
      },
      {
        order: 3,
        title: 'Reach backup service readable by the share identity',
        nature: 'inferred',
        fromEntityId: 'AS-07',
        toEntityId: 'AS-10',
        edgeId: 'E-11',
        description:
          'Backup snapshots are readable by file-share identities per policy.',
        findingIds: ['VF-06'],
      },
      {
        order: 4,
        title: 'Access sensitive data within backups',
        nature: 'assumed',
        edgeId: 'E-54',
        description:
          'Sensitive records inside the backup archives are assumed accessible once the archive is readable.',
        findingIds: ['VF-06'],
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'Share reaches the backup service; both in Internal Services.' },
      { id: 'required-identity', label: 'Required identity', result: 'pass', detail: 'Support Analyst is a confirmed identity.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'pass', detail: 'File Share Full Access is confirmed and over-scoped.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'No dependency step in this path.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'pass', detail: 'Steps remain within Internal Services.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'pass', detail: 'ACL confirmed; final archive read is a reasonable assumption from policy.' },
    ],
    llm: {
      feasibilityExplanation:
        'A legitimate support login already holds more share access than needed, and backups inherit that access — a short, low-effort chain.',
      contextualAssumptions: [
        'Readable backup archives contain sensitive records.',
      ],
      estimatedEffort: 'Low — uses only granted permissions, no exploitation.',
      estimatedImpact: 'Moderate to high — potential exposure of backed-up sensitive data.',
      likelihoodRationale:
        'All steps use confirmed, standing permissions, so likelihood is elevated.',
      rankingRationale:
        'Elevated likelihood with high evidence confidence ranks this path first.',
      defensiveMitigations: [
        'Reduce Support Analyst share permissions to least privilege (MIT-05).',
        'Restrict backup read to a dedicated backup role.',
      ],
      agreement: 'agreement',
    },
  },
  {
    id: 'AP-04',
    title: 'Service account over-reach to customer database',
    scenario:
      'Application service identity → unnecessary internal reachability → overly broad database read → cross-application data exposure.',
    startingAccess: 'Control of the Application Service Account context',
    startEntityId: 'ID-02',
    targetAssetId: 'AS-09',
    nodeIds: ['ID-02', 'AS-03', 'AS-09', 'PR-02'],
    edgeIds: ['E-21', 'E-04', 'E-30', 'E-50'],
    zonesCrossed: ['zone-app', 'zone-internal'],
    impact: 4,
    effort: 3,
    likelihood: 'moderate',
    evidenceConfidence: 'high',
    feasibility: 'feasible',
    preconditions: [
      'Ability to act as the Application Service Account (via AP-01/AP-02 or a service compromise).',
      'Unused DB route remains open (confirmed VF-10).',
      'Broad DB read grant remains (confirmed VF-07).',
    ],
    missingEvidence: [
      'No query logs confirming the broad grant has been exercised beyond the app’s normal tables.',
    ],
    mitigations: ['MIT-01', 'MIT-02'],
    steps: [
      {
        order: 1,
        title: 'Operate as the Application Service Account',
        nature: 'confirmed',
        fromEntityId: 'AS-03',
        toEntityId: 'ID-02',
        edgeId: 'E-21',
        description: 'The Application API runs under the shared service account.',
        findingIds: [],
      },
      {
        order: 2,
        title: 'Use unnecessary reachability to the customer database',
        nature: 'confirmed',
        fromEntityId: 'AS-03',
        toEntityId: 'AS-09',
        edgeId: 'E-04',
        description:
          'An unused direct network route reaches the Customer Database on 5432.',
        findingIds: ['VF-10'],
        boundaryCrossing: {
          fromZone: 'zone-app',
          toZone: 'zone-internal',
          allowedRelationship: 'TCP 5432 app-api → customer DB (flagged unused)',
          requiredIdentityOrPrivilege: 'Application Service Account + Broad DB Read',
        },
      },
      {
        order: 3,
        title: 'Exercise overly broad database read',
        nature: 'confirmed',
        toEntityId: 'PR-02',
        edgeId: 'E-30',
        description:
          'The service account can read all customer schemas, not just the app’s own tables.',
        findingIds: ['VF-07'],
        privilegeTransition: 'app tables only → read:customers.*',
      },
      {
        order: 4,
        title: 'Read cross-application customer records',
        nature: 'inferred',
        toEntityId: 'AS-09',
        edgeId: 'E-50',
        description:
          'Records belonging to other applications become readable.',
        findingIds: ['VF-07'],
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'Confirmed app-api → customer DB route (VF-10).' },
      { id: 'required-identity', label: 'Required identity', result: 'pass', detail: 'Application Service Account is confirmed.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'pass', detail: 'Broad DB Read grant is confirmed (VF-07).' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'No dependency step in this path.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'pass', detail: 'App → Internal crossing has an allowed route and satisfied identity/privilege.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'pass', detail: 'Reachability and grant confirmed; prior access to the account is a documented precondition.' },
    ],
    llm: {
      feasibilityExplanation:
        'Two confirmed over-provisioning issues — an unused DB route and a broad read grant — combine so that control of the service account yields wide customer-data read.',
      contextualAssumptions: [
        'The actor already controls the Application Service Account context.',
      ],
      estimatedEffort: 'Moderate — depends on first obtaining the service-account context.',
      estimatedImpact: 'High — direct read of the primary customer datastore across applications.',
      likelihoodRationale:
        'All technical constraints are confirmed; likelihood is held at moderate because it requires an upstream foothold.',
      rankingRationale:
        'High impact and high evidence confidence place it just below the elevated-likelihood support path.',
      defensiveMitigations: [
        'Scope the service account read grant to required tables (MIT-01).',
        'Remove the unused database route (MIT-02).',
      ],
      agreement: 'agreement',
    },
  },
  {
    id: 'AP-05',
    title: 'Shared dependency to cross-service integrity impact',
    scenario:
      'Reporting identity → writable shared dependency → another service consumes that dependency → cross-service integrity impact.',
    startingAccess: 'Reporting Service identity (shared Application Service Account)',
    startEntityId: 'ID-02',
    targetAssetId: 'AS-04',
    nodeIds: ['ID-02', 'AS-08', 'DEP-02', 'AS-04'],
    edgeIds: ['E-43', 'E-42'],
    zonesCrossed: ['zone-internal', 'zone-app'],
    impact: 3,
    effort: 4,
    likelihood: 'low',
    evidenceConfidence: 'moderate',
    feasibility: 'feasible',
    preconditions: [
      'Ability to act via the Reporting Service identity (confirmed write to DEP-02).',
      'Background Worker consumes the shared package (confirmed).',
      'Worker executes updated template content without extra validation (assumed).',
    ],
    missingEvidence: [
      'Downstream execution in the worker was not exercised; integrity impact is inferred from the dependency direction.',
    ],
    mitigations: ['MIT-06'],
    steps: [
      {
        order: 1,
        title: 'Write to the shared report-templates dependency',
        nature: 'confirmed',
        fromEntityId: 'AS-08',
        toEntityId: 'DEP-02',
        edgeId: 'E-43',
        description:
          'The reporting identity can publish/write the shared template package.',
        findingIds: ['VF-09'],
      },
      {
        order: 2,
        title: 'Background Worker consumes the altered dependency',
        nature: 'inferred',
        fromEntityId: 'AS-04',
        toEntityId: 'DEP-02',
        edgeId: 'E-42',
        description:
          'The worker pulls the shared package during normal processing.',
        findingIds: ['VF-09'],
        boundaryCrossing: {
          fromZone: 'zone-internal',
          toZone: 'zone-app',
          allowedRelationship: 'Package registry pull (worker ← report-templates)',
          requiredIdentityOrPrivilege: 'None beyond normal worker operation',
        },
      },
      {
        order: 3,
        title: 'Altered template affects worker processing',
        nature: 'assumed',
        description:
          'Changed template content is assumed to influence worker output, creating a cross-service integrity impact.',
        findingIds: [],
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'Worker pulls from the shared registry; reporting writes to it.' },
      { id: 'required-identity', label: 'Required identity', result: 'pass', detail: 'Reporting identity write is confirmed (VF-09).' },
      { id: 'required-privilege', label: 'Required privilege', result: 'pass', detail: 'Write to report-templates is confirmed.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'pass', detail: 'Worker and reporting both use report-templates@1.7.0 — compatible.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'pass', detail: 'Registry pull across Internal → Application is an allowed relationship.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'pass', detail: 'Write and consumption confirmed; execution effect is an explicit assumption.' },
    ],
    llm: {
      feasibilityExplanation:
        'A writable shared dependency consumed by another service is a real integrity concern, but the final execution effect is assumed rather than observed.',
      contextualAssumptions: [
        'The worker applies template content without independent validation.',
        'Template changes can alter worker behavior meaningfully.',
      ],
      estimatedEffort: 'Higher — requires the reporting identity and knowledge of how the worker uses templates.',
      estimatedImpact: 'Moderate — integrity of worker output rather than direct data disclosure.',
      likelihoodRationale:
        'The decisive step is an assumption about worker behavior, so likelihood is kept low.',
      rankingRationale:
        'Ranked lowest of the accepted paths: it depends on an unverified execution assumption.',
      defensiveMitigations: [
        'Make report-templates read-only for the reporting identity and review publishes (MIT-06).',
        'Validate or sign shared template content before the worker uses it.',
      ],
      agreement: 'needs-review',
    },
  },

  /* ----------------------- rejected paths ------------------------- */
  {
    id: 'AP-06',
    title: 'Direct portal-to-database exfiltration',
    scenario:
      'Hypothesized direct read of the Customer Database from the public portal.',
    startingAccess: 'Anonymous access to the public portal',
    startEntityId: 'AS-01',
    targetAssetId: 'AS-09',
    nodeIds: ['AS-01', 'AS-09'],
    edgeIds: [],
    zonesCrossed: ['zone-external', 'zone-internal'],
    impact: 5,
    effort: 2,
    likelihood: 'low',
    evidenceConfidence: 'high',
    feasibility: 'rejected',
    rejectionReason:
      'No allowed network relationship exists between the Public Web Portal (External) and the Customer Database (Internal Services). The required "can reach" edge is absent from the asset inventory, so the first hop cannot occur.',
    preconditions: ['Would require a direct route from the portal to the database (absent).'],
    missingEvidence: [
      'No can-reach edge AS-01 → AS-09 in the network inventory.',
    ],
    mitigations: [],
    steps: [
      {
        order: 1,
        title: 'Attempt direct portal → database connection',
        nature: 'assumed',
        fromEntityId: 'AS-01',
        toEntityId: 'AS-09',
        description:
          'The candidate assumes the portal can reach the customer database directly. No such network relationship is recorded.',
        findingIds: ['VF-01', 'VF-07'],
        boundaryCrossing: {
          fromZone: 'zone-external',
          toZone: 'zone-internal',
          allowedRelationship: 'NONE — no route exists',
          requiredIdentityOrPrivilege: 'Not evaluated (reachability fails first)',
        },
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'fail', detail: 'No allowed relationship between AS-01 (External) and AS-09 (Internal Services). The path cannot start.' },
      { id: 'required-identity', label: 'Required identity', result: 'n/a', detail: 'Not evaluated — reachability already failed.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'n/a', detail: 'Not evaluated — reachability already failed.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'Not applicable.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'fail', detail: 'External → Internal Services direct access violates the boundary policy; no permitted relationship.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'fail', detail: 'The required route precondition is unmet.' },
    ],
    llm: {
      feasibilityExplanation:
        'Even though both endpoints have findings, the deterministic layer rejects this candidate: there is simply no network path from the portal to the database. The LLM does not override a failed hard constraint.',
      contextualAssumptions: [],
      estimatedEffort: 'Not assessed — rejected before effort is considered.',
      estimatedImpact: 'Would be high if it existed, but the path is infeasible.',
      likelihoodRationale:
        'Likelihood is not meaningful for an infeasible path.',
      rankingRationale:
        'Excluded from ranking: the deterministic network-reachability check fails.',
      defensiveMitigations: [
        'Maintain the segmentation that already blocks this path.',
      ],
      agreement: 'rejected',
    },
  },
  {
    id: 'AP-07',
    title: 'Guest escalation to management console',
    scenario:
      'Hypothesized escalation from an anonymous guest to the Management Console.',
    startingAccess: 'Anonymous access to the public portal',
    startEntityId: 'ID-01',
    targetAssetId: 'AS-12',
    nodeIds: ['ID-01', 'AS-01', 'AS-12', 'AS-11'],
    edgeIds: [],
    zonesCrossed: ['zone-external', 'zone-mgmt'],
    impact: 5,
    effort: 4,
    likelihood: 'low',
    evidenceConfidence: 'moderate',
    feasibility: 'rejected',
    rejectionReason:
      'The Guest User identity holds no privilege that authenticates to the Management Console or Identity Provider. The required admin-console privilege is not satisfied by any confirmed has-privilege edge.',
    preconditions: ['Would require an admin privilege the guest does not hold.'],
    missingEvidence: [
      'No has-privilege edge granting ID-01 any management-plane role.',
    ],
    mitigations: [],
    steps: [
      {
        order: 1,
        title: 'Guest attempts to authenticate to the management console',
        nature: 'assumed',
        fromEntityId: 'ID-01',
        toEntityId: 'AS-12',
        description:
          'The candidate assumes the guest can obtain a management-console session. No privilege grants this.',
        findingIds: [],
        boundaryCrossing: {
          fromZone: 'zone-external',
          toZone: 'zone-mgmt',
          allowedRelationship: 'No permitted external → management relationship',
          requiredIdentityOrPrivilege: 'Admin console login (not held)',
        },
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'n/a', detail: 'Management plane is not reachable from External; not separately evaluated.' },
      { id: 'required-identity', label: 'Required identity', result: 'fail', detail: 'Guest User cannot assume any management identity.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'fail', detail: 'No confirmed privilege grants the guest console or IdP admin access.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'n/a', detail: 'Not applicable.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'fail', detail: 'External → Management crossing is not permitted and no identity satisfies it.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'fail', detail: 'Required admin privilege precondition is unmet.' },
    ],
    llm: {
      feasibilityExplanation:
        'The chain would need an administrative privilege that no confirmed edge grants the guest. The deterministic privilege check fails and the candidate is rejected.',
      contextualAssumptions: [],
      estimatedEffort: 'Not assessed — rejected on privilege grounds.',
      estimatedImpact: 'Would be high, but the required privilege does not exist for this identity.',
      likelihoodRationale: 'Not meaningful for a rejected path.',
      rankingRationale:
        'Excluded from ranking: the required-privilege check fails.',
      defensiveMitigations: [
        'Keep management-plane access off the external surface and require strong admin authentication.',
      ],
      agreement: 'rejected',
    },
  },
  {
    id: 'AP-08',
    title: 'Reporting dependency exploitation via outdated library',
    scenario:
      'Hypothesized compromise relying on a vulnerable version of the shared library.',
    startingAccess: 'Access to the Reporting Service dependency surface',
    startEntityId: 'AS-08',
    targetAssetId: 'AS-03',
    nodeIds: ['AS-08', 'DEP-01', 'AS-03'],
    edgeIds: ['E-41', 'E-40'],
    zonesCrossed: ['zone-internal', 'zone-app'],
    impact: 4,
    effort: 3,
    likelihood: 'low',
    evidenceConfidence: 'moderate',
    feasibility: 'rejected',
    rejectionReason:
      'Dependency compatibility check failed. The candidate requires shared-auth-lib < 2.0.0 (the version an advisory applies to), but the confirmed installed version is 2.3.1. The precondition — vulnerable version present — is not satisfied.',
    preconditions: ['Would require the vulnerable dependency version (not present).'],
    missingEvidence: [
      'Installed version 2.3.1 is outside the advisory range; no vulnerable build is deployed.',
    ],
    mitigations: [],
    steps: [
      {
        order: 1,
        title: 'Target the shared library in the Reporting Service',
        nature: 'confirmed',
        fromEntityId: 'AS-08',
        toEntityId: 'DEP-01',
        edgeId: 'E-41',
        description:
          'The Reporting Service uses the shared library (confirmed), but at a version outside the advisory.',
        findingIds: ['VF-08'],
      },
      {
        order: 2,
        title: 'Assume the advisory applies and pivot to the API',
        nature: 'assumed',
        fromEntityId: 'AS-03',
        toEntityId: 'DEP-01',
        edgeId: 'E-40',
        description:
          'The candidate assumes a vulnerable library version enables a pivot. The installed version does not match.',
        findingIds: ['VF-08'],
      },
    ],
    checks: [
      { id: 'network-reachability', label: 'Network reachability', result: 'pass', detail: 'Both services use the library; reachability is not the blocker.' },
      { id: 'required-identity', label: 'Required identity', result: 'n/a', detail: 'Not reached — compatibility fails first.' },
      { id: 'required-privilege', label: 'Required privilege', result: 'n/a', detail: 'Not reached — compatibility fails first.' },
      { id: 'dependency-compatibility', label: 'Dependency compatibility', result: 'fail', detail: 'Requires shared-auth-lib < 2.0.0; installed version is 2.3.1. Incompatible.' },
      { id: 'trust-boundary-policy', label: 'Trust-boundary policy', result: 'n/a', detail: 'Not evaluated — compatibility already failed.' },
      { id: 'preconditions', label: 'Satisfied preconditions', result: 'fail', detail: 'The "vulnerable version present" precondition is unmet.' },
    ],
    llm: {
      feasibilityExplanation:
        'The hygiene finding (VF-08) is real, but the advisory does not apply to the installed version. The deterministic compatibility check fails, so the candidate is rejected regardless of narrative plausibility.',
      contextualAssumptions: [],
      estimatedEffort: 'Not assessed — rejected on compatibility grounds.',
      estimatedImpact: 'Would be high, but the required vulnerable version is absent.',
      likelihoodRationale: 'Not meaningful for a rejected path.',
      rankingRationale:
        'Excluded from ranking: dependency compatibility fails and a precondition is unmet.',
      defensiveMitigations: [
        'Keep the shared library patched above the advisory range (already the case).',
      ],
      agreement: 'rejected',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Recent analysis activity                                            */
/* ------------------------------------------------------------------ */
export const activity: ActivityItem[] = [
  { id: 'ACT-1', time: '09:41', label: 'Normalized input evidence', detail: '10 findings across 7 sources ingested and de-duplicated.', kind: 'ingest' },
  { id: 'ACT-2', time: '09:41', label: 'Built environment graph', detail: '12 assets, 4 identities, 3 privileges, 2 dependencies linked.', kind: 'graph' },
  { id: 'ACT-3', time: '09:42', label: 'Enumerated candidate paths', detail: '8 candidate chains generated from finding combinations.', kind: 'enumerate' },
  { id: 'ACT-4', time: '09:42', label: 'Applied deterministic constraints', detail: '5 candidates passed; 3 rejected by hard constraints.', kind: 'validate' },
  { id: 'ACT-5', time: '09:43', label: 'Generated simulated LLM explanations', detail: 'Feasibility rationale produced for all surviving paths.', kind: 'llm' },
  { id: 'ACT-6', time: '09:43', label: 'Ranked paths and prepared report', detail: 'Demo priority score computed; report draft assembled.', kind: 'report' },
];

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */
export const allSources: Finding['source'][] = [
  'SAST',
  'SCA',
  'DAST',
  'Asset inventory',
  'Identity & access export',
  'Configuration scan',
  'Manual verification',
];

export const entityById = (id: string) => {
  return (
    assets.find((a) => a.id === id) ||
    identities.find((i) => i.id === id) ||
    privileges.find((p) => p.id === id) ||
    dependencies.find((d) => d.id === id) ||
    findings.find((f) => f.id === id)
  );
};

export const entityName = (id: string): string => {
  const e = entityById(id);
  if (!e) return id;
  if ('title' in e) return e.title;
  return e.name;
};

export const zoneById = (id: string) => zones.find((z) => z.id === id);
export const assetById = (id: string) => assets.find((a) => a.id === id);
export const pathById = (id: string) => attackPaths.find((p) => p.id === id);
export const findingById = (id: string) => findings.find((f) => f.id === id);
export const mitigationById = (id: string) => mitigations.find((m) => m.id === id);
