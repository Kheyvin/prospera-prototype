/* PRIMUS module registry. Classic-script module system shared by the browser bundle
 * and the Node test loader. See CONTRACTS.md §1. */
(function (root) {
  'use strict';
  var registry = new Map();
  var cache = new Map();
  var resolving = [];

  function moduleFn(id, factory) {
    if (typeof id !== 'string' || !id) throw new Error('Primus.module: id must be a non-empty string');
    if (typeof factory !== 'function') throw new Error('Primus.module: factory must be a function for ' + id);
    if (registry.has(id)) throw new Error('Primus.module: duplicate module id ' + id);
    registry.set(id, factory);
  }

  function requireFn(id) {
    if (cache.has(id)) return cache.get(id);
    var factory = registry.get(id);
    if (!factory) throw new Error('Primus.require: unknown module ' + id);
    if (resolving.indexOf(id) !== -1) {
      throw new Error('Primus.require: circular factory-time dependency ' + resolving.concat(id).join(' -> '));
    }
    resolving.push(id);
    var api;
    try {
      api = factory(requireFn);
    } finally {
      resolving.pop();
    }
    if (api === undefined) api = {};
    cache.set(id, api);
    return api;
  }

  var Primus = {
    module: moduleFn,
    require: requireFn,
    has: function (id) { return registry.has(id); },
    moduleIds: function () { return Array.from(registry.keys()); },
    /* Test-only: drop a cached instance so a fresh factory run is possible. */
    _resetCache: function () { cache = new Map(); }
  };

  root.Primus = Primus;
  if (typeof module !== 'undefined' && module.exports) module.exports = Primus;
})(typeof globalThis !== 'undefined' ? globalThis : this);
