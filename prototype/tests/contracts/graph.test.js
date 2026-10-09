'use strict';
/* Contract tests for core/graph (CONTRACTS §5.4; spec §9.1 traversals, WEB-07 history,
 * §14.2 search, §16.1 counts). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntime } = require('../helpers/load.js');

const P = loadRuntime({ allowMissing: true });
const pack = P.loadPack();
const graph = P.require('core/graph').createGraph(pack);

function ids(list) { return list.map((x) => x.id); }

test('areaPositions(A-AF) = J-02..J-05 plus the external positions J-X1/J-X2 in pack order', () => {
  assert.deepEqual(ids(graph.areaPositions('A-AF')), ['J-02', 'J-03', 'J-04', 'J-05', 'J-X1', 'J-X2']);
  assert.deepEqual(ids(graph.areaPositions('A-MKT')).includes('J-02'), false);
});

test('positionOccupants(J-08) returns the four sales executives', () => {
  const occupants = graph.positionOccupants('J-08');
  assert.equal(occupants.length, 4);
  assert.deepEqual(ids(occupants), ['P-08', 'P-09', 'P-10', 'P-11']);
  for (const p of occupants) assert.equal(p.type, 'person');
  assert.equal(graph.personPosition('P-03').id, 'J-03');
  assert.equal(graph.positionArea('J-03').id, 'A-AF');
});

test('role ↔ position mapping of the case', () => {
  assert.deepEqual(ids(graph.rolePositions('RL-ADMIN')), ['J-03']);
  assert.deepEqual(ids(graph.rolePositions('RL-VENTAS')), ['J-08']);
  assert.deepEqual(ids(graph.rolePositions('RL-CONT')), ['J-04']);
  assert.deepEqual(ids(graph.positionRoles('J-03')), ['RL-ADMIN']);
  assert.deepEqual(ids(graph.roleActivities('RL-ADMIN', 'V-ASIS-01')), ['A-03', 'A-04', 'A-06']);
});

test('objectiveTraversal(OBJ-01) follows objective → process → AS-IS activities → roles/positions/systems and nothing else', () => {
  const t = graph.objectiveTraversal('OBJ-01');
  const set = new Set(t.entityIds);
  assert.equal(t.rootId, 'OBJ-01');
  assert.equal(t.versionId, 'V-ASIS-01');
  for (const id of ['OBJ-01', 'PR-BOLETAS', 'A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08',
    'RL-VENTAS', 'RL-ADMIN', 'RL-CONT', 'J-08', 'J-03', 'J-04', 'SYS-WA', 'SYS-DRIVE', 'SYS-MAIL']) {
    assert.ok(set.has(id), `expected ${id} in traversal`);
  }
  /* no second-order neighbours, no TO-BE activities, nothing from marketing */
  for (const id of ['A-MKT', 'J-10', 'J-11', 'J-12', 'T-01', 'T-02', 'SYS-SPERANT', 'SYS-FACT', 'DOC-DNI', 'P-03', 'P-08']) {
    assert.equal(set.has(id), false, `${id} must not be in the objective traversal`);
  }
  const areaIds = t.entityIds.filter((id) => graph.type(id) === 'area');
  assert.deepEqual(areaIds, [], 'areas are not part of the objective traversal');
  for (const relId of t.relationIds) {
    const rel = pack.relations.get(relId);
    assert.ok(rel, relId);
    assert.ok(set.has(rel.from) && set.has(rel.to), `relation ${relId} must join traversed entities`);
  }
});

test('areaTraversal(A-AF) collects positions, occupants, processes and reports neighbours', () => {
  const t = graph.areaTraversal('A-AF');
  const set = new Set(t.entityIds);
  for (const id of ['A-AF', 'J-02', 'J-03', 'J-04', 'J-05', 'P-02', 'P-03', 'P-04', 'P-05', 'PR-BOLETAS']) assert.ok(set.has(id), id);
  assert.equal(set.has('A-COM'), false, 'neighbour areas are reported, not traversed');
  assert.ok(t.neighbors.includes('A-COM'), 'A-COM participates in PR-BOLETAS');
});

test('history(PR-BOLETAS) lists the three pack versions with null publication data', () => {
  const rows = graph.history('PR-BOLETAS', { versions: {}, currentAsIsVersionId: 'V-ASIS-01' });
  assert.deepEqual(rows.map((r) => r.versionId), ['V-ASIS-01', 'V-TOBE-01', 'V-TOBE-02']);
  for (const row of rows) {
    assert.equal(row.publishedAt, null, row.versionId);
    assert.equal(row.publishedBy, null, row.versionId);
    assert.equal(row.isDemo, false);
    assert.equal(typeof row.stateLabel, 'string');
    assert.ok(row.sourceIds.length > 0, 'pack versions cite their sources');
  }
  assert.deepEqual(rows.map((r) => r.stateLabel), ['Documentado', 'Borrador incompleto', 'Propuesto']);
  assert.equal(rows[0].isCurrentAsIs, true);
  /* non-versioned entity → single "Referencia inicial" row */
  const ref = graph.history('J-03', { versions: {} });
  assert.equal(ref.length, 1);
  assert.equal(ref[0].versionId, null);
  assert.equal(ref[0].label, 'Referencia inicial');
  assert.equal(ref[0].publishedAt, null);
});

test('search normalizes diacritics/case and matches name, type and id', () => {
  const xyomara = graph.search('xyomara');
  assert.deepEqual(xyomara.map((r) => r.id), ['P-03']);
  assert.equal(xyomara[0].matchedOn, 'name');
  const admin = graph.search('administracion').map((r) => r.id);
  assert.ok(admin.includes('A-AF'), 'area Administración y Finanzas');
  assert.ok(admin.includes('J-02'), 'position Jefa de Administración y Finanzas');
  assert.equal(admin.includes('J-03'), false, '«Asistente administrativa» does not contain «administracion» (partial match on name/type/id only)');
  assert.deepEqual(graph.search('ADMINISTRACIÓN').map((r) => r.id), admin, 'case and diacritics are ignored');
  assert.deepEqual(graph.search('  '), []);
  assert.deepEqual(graph.search('pr-boletas').map((r) => r.id), ['PR-BOLETAS']);
  const typed = graph.search('boletas', { types: ['process'] });
  assert.ok(typed.every((r) => r.type === 'process'));
});

test('search respects the allowed entity set and includes versions only on demand', () => {
  const restricted = graph.search('ventas', { entityIds: new Set(['RL-VENTAS']) });
  assert.deepEqual(restricted.map((r) => r.id), ['RL-VENTAS']);
  const withoutVersions = graph.search('to-be');
  assert.equal(withoutVersions.some((r) => r.type === 'version'), false);
  const withVersions = graph.search('to-be', { includeVersions: true });
  assert.ok(withVersions.some((r) => r.type === 'version' && r.versionId === 'V-TOBE-02'));
});

test('counts over the whole pack match §16.1', () => {
  const c = graph.counts(null);
  assert.equal(c.areas, 6);
  assert.equal(c.positions, 20);
  assert.equal(c.externalPositions, 5);
  assert.equal(c.people, 23);
  assert.equal(c.externals, 5);
  assert.equal(c.processesDetailed, 1);
  assert.equal(c.processesSummary, 10);
  const subset = graph.counts(new Set(['A-AF', 'J-02', 'P-02', 'PR-BOLETAS']));
  assert.deepEqual([subset.areas, subset.positions, subset.people, subset.processesDetailed, subset.processesSummary], [1, 1, 1, 1, 0]);
});

test('areaProcesses and processArea agree on PR-BOLETAS ownership', () => {
  const ap = graph.areaProcesses('A-AF');
  assert.ok(ids(ap.owned).includes('PR-BOLETAS'));
  assert.equal(graph.processArea('PR-BOLETAS').id, 'A-AF');
  assert.ok(ids(graph.areaProcesses('A-COM').participating).includes('PR-BOLETAS'));
  assert.deepEqual(ids(graph.processVersions('PR-BOLETAS')), ['V-ASIS-01', 'V-TOBE-01', 'V-TOBE-02']);
});

test('activityResources and raci resolve roles, systems and documents for A-03', () => {
  const a03 = graph.resolveActivity('V-ASIS-01', 'A-03');
  const res = graph.activityResources(a03);
  assert.deepEqual(ids(res.roles), ['RL-ADMIN']);
  assert.deepEqual(ids(res.systems), ['SYS-DRIVE']);
  assert.ok(ids(res.documents.requires).includes('DOC-VOUCHER'));
  const raci = graph.raci('PR-BOLETAS', 'V-ASIS-01');
  assert.deepEqual(ids(raci.columns), ['RL-VENTAS', 'RL-ADMIN', 'RL-CONT']);
  assert.equal(raci.rows.length, 8);
  const row = raci.rows.find((r) => r.key === 'A-03');
  assert.deepEqual(row.cells, { 'RL-VENTAS': null, 'RL-ADMIN': 'R', 'RL-CONT': null });
});
