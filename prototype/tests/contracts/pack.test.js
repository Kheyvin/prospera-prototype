'use strict';
/* Contract tests for the Próspera pack (CONTRACTS §4, spec §9, §10.4 WEB-04/WEB-06, §16).
 * Structural facts only: counts, ids, flow sequences, null measurements, forbidden strings.
 * Visible texts are not asserted here beyond what the spec fixes as ids/labels. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntime } = require('../helpers/load.js');

const P = loadRuntime({ allowMissing: true });
const raw = P.loadRawPack();
const pack = P.loadPack();
const org = raw.organization;

function ids(list) { return (list || []).map((x) => x.id); }

function range(prefix, from, to) {
  const out = [];
  for (let i = from; i <= to; i++) out.push(prefix + (i < 10 ? '0' : '') + i);
  return out;
}

function edgeKey(e) { return e.from + '>' + e.to; }

test('every id is globally unique across the collections of CONTRACTS §4', () => {
  const all = [];
  all.push(...ids(org.entities));
  all.push(...ids(org.relations));
  all.push(...ids(raw.sources));
  all.push(...ids(raw.solution.nodes));
  all.push(...ids(raw.solution.edges));
  all.push(...ids(raw.scope.items));
  all.push(...ids(raw.methodologies.items));
  all.push(...ids(org.versions));
  all.push(...Object.keys(org.flows));
  for (const flow of Object.values(org.flows)) all.push(...ids(flow.edges));
  all.push(...ids(raw.scenarios));
  for (const sc of raw.scenarios) all.push(...ids(sc.events));
  all.push(...ids(raw.demo.profiles));
  all.push(...ids(raw.security.accounts));
  all.push(...ids(raw.tracking.incidents));
  all.push(...ids(raw.tracking.projects));
  all.push(...ids(raw.desktop.workspaces));
  all.push(...ids(raw.desktop.sessions));
  all.push(...ids(raw.desktop.evidence));
  const seen = new Set();
  const dupes = [];
  for (const id of all) {
    assert.equal(typeof id, 'string', `id must be a string: ${JSON.stringify(id)}`);
    assert.ok(id.length > 0, 'id must not be empty');
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  assert.deepEqual(dupes, [], 'duplicate ids');
});

test('the validator accepts the pack and no forbidden string appears anywhere', () => {
  const validator = P.require('schemas/pack-validator');
  const result = validator.validatePack(raw);
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 1));
  const text = JSON.stringify(raw);
  for (const needle of ['/home/', 'C:\\\\', 'file://', 'http://', '<script', 'javascript:']) {
    assert.equal(text.toLowerCase().includes(needle.toLowerCase()), false, `forbidden string ${needle}`);
  }
  /* https only inside methodology external references */
  const stripped = JSON.parse(JSON.stringify(raw, (key, value) => (key === 'externalReference' ? undefined : value)));
  assert.equal(JSON.stringify(stripped).includes('https://'), false, 'https only in externalReference.url');
});

test('there is exactly one client and it is prospera', () => {
  assert.equal(raw.schemaVersion, 1);
  assert.equal(raw.client.id, 'prospera');
  const clientIds = new Set();
  JSON.stringify(raw, (key, value) => {
    if (key === 'clientId' || (key === 'client' && value && typeof value === 'object' && value.id)) clientIds.add(typeof value === 'object' ? value.id : value);
    return value;
  });
  assert.deepEqual([...clientIds], ['prospera']);
  assert.deepEqual(Object.keys(P.manifest.clients), ['prospera']);
});

test('23 internal occupants P-01..P-23 and 5 external providers', () => {
  const people = pack.byType.get('person') || [];
  assert.deepEqual(ids(people), range('P-', 1, 23));
  for (const p of people) assert.equal(p.attributes.kind, 'internal', p.id);
  const externals = pack.byType.get('externalProvider') || [];
  assert.equal(externals.length, 5);
  assert.deepEqual(ids(externals), range('EXT-', 1, 5));
});

test('20 internal positions J-01..J-20 plus 5 external J-X1..J-X5', () => {
  const positions = pack.byType.get('position') || [];
  const internal = positions.filter((p) => !(p.attributes && p.attributes.external));
  const external = positions.filter((p) => p.attributes && p.attributes.external);
  assert.deepEqual(ids(internal), range('J-', 1, 20));
  assert.deepEqual(ids(external), ['J-X1', 'J-X2', 'J-X3', 'J-X4', 'J-X5']);
  assert.equal(pack.entities.get('J-08').attributes.collective, true, 'J-08 is the collective sales position');
});

test('6 areas, 10 portfolio processes, PR-BOLETAS detailed and MP-AF macroprocess', () => {
  assert.deepEqual(ids(pack.byType.get('area')), ['A-AF', 'A-COM', 'A-MKT', 'A-PRO', 'A-TER', 'A-LEG']);
  const processes = pack.byType.get('process') || [];
  const portfolio = processes.filter((p) => p.attributes && p.attributes.portfolio);
  assert.deepEqual(ids(portfolio), range('PR-', 1, 10));
  const detailed = processes.filter((p) => p.attributes && p.attributes.detailed);
  assert.deepEqual(ids(detailed), ['PR-BOLETAS']);
  assert.equal(processes.length, 11);
  assert.deepEqual(ids(pack.byType.get('macroprocess')), ['MP-AF']);
  assert.equal(pack.entities.get('MP-AF').attributes.proposed, true);
});

test('three roles exist with lane labels', () => {
  assert.deepEqual(ids(pack.byType.get('role')), ['RL-VENTAS', 'RL-ADMIN', 'RL-CONT']);
  for (const role of pack.byType.get('role')) assert.equal(typeof role.attributes.laneLabel, 'string', role.id);
});

test('A-01..A-08 belong to V-ASIS-01 and T-01..T-08 to V-TOBE-02', () => {
  const asIs = pack.baseActivities('V-ASIS-01');
  assert.deepEqual(Object.keys(asIs), range('A-', 1, 8));
  const toBe = pack.baseActivities('V-TOBE-02');
  assert.deepEqual(Object.keys(toBe), range('T-', 1, 8));
  assert.deepEqual(Object.keys(pack.baseActivities('V-TOBE-01')), [], 'the incomplete draft has no navigable activities');
  for (const a of pack.byType.get('activity')) {
    assert.equal(a.attributes.nodeKind, 'task', a.id);
    assert.equal(a.attributes.key, a.id, 'base activities use their id as key');
  }
});

test('FLOW-ASIS sequence matches spec §10.4 WEB-04 exactly', () => {
  const flow = pack.flows.get('FLOW-ASIS');
  assert.equal(flow.processId, 'PR-BOLETAS');
  assert.deepEqual(ids(flow.lanes), ['L-VENTAS', 'L-ADMIN', 'L-CONT']);
  const expected = [
    'A-START>A-01', 'A-01>A-02', 'A-02>A-03', 'A-03>A-04', 'A-04>A-G1',
    'A-G1>A-06', 'A-06>A-07', 'A-07>A-08', 'A-08>A-END',
    'A-G1>A-05', 'A-05>A-03'
  ];
  assert.deepEqual(flow.edges.map(edgeKey).sort(), expected.slice().sort());
  const byKey = Object.fromEntries(flow.edges.map((e) => [edgeKey(e), e]));
  assert.equal(byKey['A-G1>A-06'].label, 'Sí');
  assert.equal(byKey['A-G1>A-05'].label, 'No');
  assert.equal(byKey['A-G1>A-05'].loop, true);
  assert.equal(byKey['A-05>A-03'].loop, true);
  const kinds = Object.fromEntries(flow.nodes.map((n) => [n.id, n.kind]));
  assert.equal(kinds['A-START'], 'start');
  assert.equal(kinds['A-G1'], 'decision');
  assert.equal(kinds['A-END'], 'end');
  for (const id of range('A-', 1, 8)) assert.equal(kinds[id], 'task', id);
  assert.equal(flow.defaultVariant, 'separacion');
  const variants = Object.fromEntries(flow.variants.map((v) => [v.id, v]));
  assert.equal(variants.separacion.available, true);
  assert.equal(variants.cuotaInicial.available, true);
  assert.equal(variants.cuotaNormal.available, false);
  assert.equal(typeof variants.cuotaNormal.message, 'string');
});

test('FLOW-TOBE2 sequence matches spec §10.4 WEB-06 exactly', () => {
  const flow = pack.flows.get('FLOW-TOBE2');
  const expected = [
    'T-START>T-01', 'T-01>T-02', 'T-02>T-G1',
    'T-G1>T-03', 'T-03>T-02',
    'T-G1>T-04', 'T-04>T-05', 'T-05>T-G2',
    'T-G2>T-06', 'T-06>T-05',
    'T-G2>T-07', 'T-07>T-08', 'T-08>T-END'
  ];
  assert.deepEqual(flow.edges.map(edgeKey).sort(), expected.slice().sort());
  const byKey = Object.fromEntries(flow.edges.map((e) => [edgeKey(e), e]));
  assert.equal(byKey['T-G1>T-03'].label, 'No');
  assert.equal(byKey['T-G1>T-04'].label, 'Sí');
  assert.equal(byKey['T-G2>T-06'].label, 'No');
  assert.equal(byKey['T-G2>T-07'].label, 'Sí');
  assert.equal(byKey['T-03>T-02'].loop, true);
  assert.equal(byKey['T-06>T-05'].loop, true);
  const kinds = Object.fromEntries(flow.nodes.map((n) => [n.id, n.kind]));
  assert.equal(kinds['T-G1'], 'decision');
  assert.equal(kinds['T-G2'], 'decision');
  assert.ok(flow.systemChip && flow.systemChip.systemId === 'SYS-SPERANT');
  assert.deepEqual(flow.systemChip.betweenNodeIds, ['T-04', 'T-05']);
  const groups = Object.fromEntries((flow.groups || []).map((g) => [g.id, g.subtaskIds]));
  assert.deepEqual(groups['T-06'], ['T-06a', 'T-06b']);
  assert.deepEqual(groups['T-08'], ['T-08a', 'T-08b']);
});

test('FLOW-TOBE1 is an incomplete draft without navigable nodes', () => {
  const flow = pack.flows.get('FLOW-TOBE1');
  assert.equal(flow.incomplete, true);
  assert.deepEqual(flow.items, ['Tarea 1', 'Tarea 2', 'Subprocesos sin detalle']);
  assert.equal((flow.nodes || []).length, 0);
  const version = pack.versions.get('V-TOBE-01');
  assert.equal(version.state, 'incomplete-draft');
  assert.equal(version.publishable, false);
});

test('pack versions carry null publication metadata and the AS-IS pointer', () => {
  assert.deepEqual(ids(org.versions), ['V-ASIS-01', 'V-TOBE-01', 'V-TOBE-02']);
  for (const v of org.versions) {
    assert.equal(v.publishedAt, null, v.id);
    assert.equal(v.publishedBy, null, v.id);
    assert.equal(v.isDemo, false, v.id);
  }
  assert.equal(org.currentAsIsVersionId, 'V-ASIS-01');
  assert.equal(pack.versions.get('V-ASIS-01').flowId, 'FLOW-ASIS');
  assert.equal(pack.versions.get('V-TOBE-02').flowId, 'FLOW-TOBE2');
});

test('KPI-01 has no measurement (value null)', () => {
  const kpi = pack.entities.get('KPI-01');
  assert.equal(kpi.type, 'indicator');
  assert.equal(kpi.attributes.value, null);
  assert.equal(kpi.attributes.numerator, null);
  assert.equal(kpi.attributes.denominator, null);
  assert.equal(kpi.attributes.target, null);
  assert.equal(kpi.attributes.measuredAt, null);
  assert.equal(typeof kpi.attributes.formula, 'string');
});

test('V-TOBE-03 and V-ASIS-02 are not pack versions (created by scenarios only)', () => {
  assert.equal(pack.versions.has('V-TOBE-03'), false);
  assert.equal(pack.versions.has('V-ASIS-02'), false);
  const scn = Object.fromEntries(raw.scenarios.map((s) => [s.id, s]));
  assert.equal(scn['SCN-01'].outcome.version.id, 'V-TOBE-03');
  assert.equal(scn['SCN-02'].outcome.version.id, 'V-ASIS-02');
});

test('profiles: four demo profiles with the spec roles and visibility', () => {
  assert.deepEqual(ids(raw.demo.profiles), ['U-ADMIN', 'U-MANAGER', 'U-EMPLOYEE', 'U-OWNER']);
  assert.equal(raw.demo.initialProfileId, 'U-MANAGER');
  const byId = Object.fromEntries(raw.demo.profiles.map((p) => [p.id, p]));
  assert.equal(byId['U-ADMIN'].accessRole, 'admin');
  assert.equal(byId['U-MANAGER'].accessRole, 'manager');
  assert.equal(byId['U-EMPLOYEE'].accessRole, 'employee');
  assert.deepEqual(byId['U-EMPLOYEE'].visibility.versionTypes, ['AS-IS']);
  assert.equal(byId['U-EMPLOYEE'].visibility.tracking, false);
  assert.deepEqual(byId['U-OWNER'].grants.processOwnerOf, ['PR-BOLETAS']);
  assert.deepEqual(byId['U-OWNER'].visibility.versionTypes, ['AS-IS', 'TO-BE']);
  assert.equal(byId['U-OWNER'].visibility.tracking, true);
  assert.equal(byId['U-OWNER'].personId, null, 'the owner is not attributed to a person');
});

test('tracking fixtures: three incidents, PM-01 and three accounts', () => {
  assert.deepEqual(ids(raw.tracking.incidents), ['INC-DEMO-01', 'INC-DEMO-02', 'INC-DEMO-03']);
  assert.deepEqual(ids(raw.tracking.projects), ['PM-01']);
  assert.equal(raw.tracking.projects[0].targetVersionId, 'V-TOBE-02');
  assert.deepEqual(ids(raw.security.accounts), ['ACCOUNT-01', 'ACCOUNT-02', 'ACCOUNT-03']);
  const admins = raw.security.accounts.filter((a) => a.role === 'admin' && a.status === 'active');
  assert.equal(admins.length, 1, 'exactly one active admin in the fixture (MSG-08 scenarios)');
  for (const a of raw.security.accounts) {
    assert.equal(a.isTest, true, a.id);
    assert.equal('password' in a, false, 'no credentials in the pack');
  }
});
