import { describe, it, expect } from 'vitest';
import {
  isTwoLevel,
  splitSistemaKey,
  empresaOf,
  groupByEmpresa,
  sistemasFor,
  dependenciasForSistema,
  navigableKeys,
  sistemasForEmpresa,
  firstNavegableKey,
  empresaHasNavegable,
  sistemaBySlug,
  defaultSistemaSlug,
  parseSistemaSearch,
  buildSistemaSearch,
  resolveSistemaIntent,
  type PortfolioTree,
} from './portfolio';

describe('portfolio · jerarquía Empresa → Sistema', () => {
  const multi = ['vitalia/platform', 'nicolify/platform', 'comunify/platform'];
  const multiMixed = ['vitalia/platform', 'vitalia/web', 'nicolify/platform'];
  const single = ['platform', 'web'];

  it('isTwoLevel detecta keys compuestas', () => {
    expect(isTwoLevel(multi)).toBe(true);
    expect(isTwoLevel(single)).toBe(false);
    expect(isTwoLevel([])).toBe(false);
  });

  it('splitSistemaKey parte empresa/sistema', () => {
    expect(splitSistemaKey('vitalia/platform')).toEqual({ empresa: 'vitalia', sistema: 'platform' });
    expect(splitSistemaKey('platform')).toEqual({ empresa: '', sistema: 'platform' });
  });

  it('splitSistemaKey solo parte en el PRIMER "/"', () => {
    expect(splitSistemaKey('a/b/c')).toEqual({ empresa: 'a', sistema: 'b/c' });
  });

  it('empresaOf devuelve el prefijo de empresa', () => {
    expect(empresaOf('vitalia/platform')).toBe('vitalia');
    expect(empresaOf('platform')).toBe('');
  });

  it('groupByEmpresa agrupa preservando orden y agrupa múltiples sistemas', () => {
    const groups = groupByEmpresa(multiMixed);
    expect(groups.map((g) => g.empresa)).toEqual(['vitalia', 'nicolify']);
    expect(groups[0].sistemas).toEqual([
      { key: 'vitalia/platform', sistema: 'platform' },
      { key: 'vitalia/web', sistema: 'web' },
    ]);
    expect(groups[1].sistemas).toEqual([{ key: 'nicolify/platform', sistema: 'platform' }]);
  });

  it('groupByEmpresa en single-mode usa empresa ""', () => {
    const groups = groupByEmpresa(single);
    expect(groups).toHaveLength(1);
    expect(groups[0].empresa).toBe('');
    expect(groups[0].sistemas.map((s) => s.key)).toEqual(['platform', 'web']);
  });

  it('sistemasFor filtra por empresa', () => {
    expect(sistemasFor(multiMixed, 'vitalia').map((s) => s.sistema)).toEqual(['platform', 'web']);
    expect(sistemasFor(multiMixed, 'nicolify').map((s) => s.sistema)).toEqual(['platform']);
    expect(sistemasFor(multiMixed, 'inexistente')).toEqual([]);
  });
});

describe('portfolio · dependencias por empresa (/api/portfolio)', () => {
  const tree: PortfolioTree = {
    mode: 'multi',
    empresas: [
      {
        slug: 'vitalia',
        kind: 'own',
        active: true,
        sistemas: [
          { slug: 'platform', procedencia: 'propio', key: 'vitalia/platform', navegable: true },
          { slug: 'odoo', procedencia: 'compartido', ref: 'odoo#company=Vitalia', navegable: false },
        ],
      },
      {
        slug: 'nicolify',
        kind: 'own',
        active: true,
        sistemas: [{ slug: 'platform', procedencia: 'propio', key: 'nicolify/platform', navegable: true }],
      },
    ],
    servicios_compartidos: [{ slug: 'odoo', nombre: 'Odoo multi-company' }],
  };

  it('null tree → sin dependencias', () => {
    expect(dependenciasForSistema(null, 'vitalia/platform')).toEqual([]);
  });

  it('devuelve las dependencias de la empresa de el sistema', () => {
    expect(dependenciasForSistema(tree, 'vitalia/platform').map((d) => d.slug)).toEqual(['odoo']);
    expect(dependenciasForSistema(tree, 'nicolify/platform')).toEqual([]);
  });

  it('empresa inexistente → vacío', () => {
    expect(dependenciasForSistema(tree, 'fantasma/x')).toEqual([]);
  });
});

describe('portfolio · derivaciones del árbol para el selector (Fase 1)', () => {
  // vitalia: instrumentada (1 navegable + 1 gap). prenter: solo gaps (no navegable).
  const tree: PortfolioTree = {
    mode: 'multi',
    default_sistema: 'vitalia/vitalia-app',
    empresas: [
      {
        slug: 'prenter',
        kind: 'factory',
        active: false,
        sistemas: [
          { slug: 'prenter-harness', procedencia: 'propio', navegable: false },
          { slug: 'odoo', procedencia: 'compartido', ref: 'odoo#company=Prenter', navegable: false },
        ],
      },
      {
        slug: 'vitalia',
        kind: 'own',
        active: true,
        sistemas: [
          { slug: 'vitalia-app', procedencia: 'propio', key: 'vitalia/vitalia-app', navegable: true },
          { slug: 'odoo', procedencia: 'compartido', ref: 'odoo#company=Vitalia', navegable: false },
        ],
      },
    ],
    servicios_compartidos: [],
  };

  it('navigableKeys aplana solo lo navegable, en orden', () => {
    expect(navigableKeys(tree)).toEqual(['vitalia/vitalia-app']);
    expect(navigableKeys(null)).toEqual([]);
  });

  it('sistemasForEmpresa devuelve los sistemas (incl. gaps) de la empresa', () => {
    expect(sistemasForEmpresa(tree, 'vitalia').map((s) => s.slug)).toEqual(['vitalia-app', 'odoo']);
    expect(sistemasForEmpresa(tree, 'prenter').map((s) => s.slug)).toEqual(['prenter-harness', 'odoo']);
    expect(sistemasForEmpresa(tree, 'fantasma')).toEqual([]);
    expect(sistemasForEmpresa(null, 'vitalia')).toEqual([]);
  });

  it('firstNavegableKey salta a la primera navegable; undefined si solo gaps', () => {
    expect(firstNavegableKey(tree, 'vitalia')).toBe('vitalia/vitalia-app');
    expect(firstNavegableKey(tree, 'prenter')).toBeUndefined();
  });

  it('empresaHasNavegable distingue empresa instrumentada de solo-gaps', () => {
    expect(empresaHasNavegable(tree, 'vitalia')).toBe(true);
    expect(empresaHasNavegable(tree, 'prenter')).toBe(false);
    expect(empresaHasNavegable(tree, 'fantasma')).toBe(false);
  });

  // ── Fase 2: selección de sistema (navegable o gap) ──
  it('sistemaBySlug resuelve el sistema elegido (navegable o gap)', () => {
    expect(sistemaBySlug(tree, 'vitalia', 'odoo')?.navegable).toBe(false);
    expect(sistemaBySlug(tree, 'vitalia', 'vitalia-app')?.navegable).toBe(true);
    expect(sistemaBySlug(tree, 'vitalia', 'fantasma')).toBeUndefined();
    expect(sistemaBySlug(tree, 'vitalia', '')).toBeUndefined();
    expect(sistemaBySlug(null, 'vitalia', 'odoo')).toBeUndefined();
  });

  it('defaultSistemaSlug prefiere el primer navegable; si solo gaps, el primer gap', () => {
    expect(defaultSistemaSlug(tree, 'vitalia')).toBe('vitalia-app'); // navegable gana
    expect(defaultSistemaSlug(tree, 'prenter')).toBe('prenter-harness'); // solo gaps → primero
    expect(defaultSistemaSlug(tree, 'fantasma')).toBe('');
    expect(defaultSistemaSlug(null, 'vitalia')).toBe('');
  });

  // ── Deep-link por URL (I-50): parse / build / resolve ──
  it('parseSistemaSearch lee ?empresa=&sistema= y omite vacíos', () => {
    expect(parseSistemaSearch('?empresa=vitalia&sistema=vitalia-app')).toEqual({
      empresa: 'vitalia',
      sistema: 'vitalia-app',
    });
    expect(parseSistemaSearch('?empresa=prenter')).toEqual({ empresa: 'prenter', sistema: undefined });
    expect(parseSistemaSearch('')).toEqual({ empresa: undefined, sistema: undefined });
    expect(parseSistemaSearch('?empresa=&sistema=')).toEqual({ empresa: undefined, sistema: undefined });
  });

  it('buildSistemaSearch serializa (con "?"; vacío si ambos vacíos)', () => {
    expect(buildSistemaSearch('vitalia', 'odoo')).toBe('?empresa=vitalia&sistema=odoo');
    expect(buildSistemaSearch('prenter', '')).toBe('?empresa=prenter');
    expect(buildSistemaSearch('', '')).toBe('');
  });

  it('parse/build round-trip', () => {
    expect(parseSistemaSearch(buildSistemaSearch('vitalia', 'odoo'))).toEqual({
      empresa: 'vitalia',
      sistema: 'odoo',
    });
  });

  it('resolveSistemaIntent: sistema navegable → key activa, no es gap', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'vitalia', sistema: 'vitalia-app' })).toEqual({
      empresa: 'vitalia',
      sistemaSlug: 'vitalia-app',
      key: 'vitalia/vitalia-app',
      isGap: false,
    });
  });

  it('resolveSistemaIntent: gap → isGap + key de fondo (primer navegable de la empresa)', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'vitalia', sistema: 'odoo' })).toEqual({
      empresa: 'vitalia',
      sistemaSlug: 'odoo',
      key: 'vitalia/vitalia-app', // navegable de fondo mientras el shell pinta el overview
      isGap: true,
    });
  });

  it('resolveSistemaIntent: empresa solo-gaps → isGap + key undefined', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'prenter', sistema: 'odoo' })).toEqual({
      empresa: 'prenter',
      sistemaSlug: 'odoo',
      key: undefined, // ningún navegable en la empresa
      isGap: true,
    });
  });

  it('resolveSistemaIntent: slug ajeno a la empresa → cae al default de la empresa', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'vitalia', sistema: 'fantasma' })).toEqual({
      empresa: 'vitalia',
      sistemaSlug: 'vitalia-app', // defaultSistemaSlug(vitalia)
      key: 'vitalia/vitalia-app',
      isGap: false,
    });
  });

  it('resolveSistemaIntent: sin sistema → default de la empresa', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'prenter' })).toEqual({
      empresa: 'prenter',
      sistemaSlug: 'prenter-harness', // primer gap (solo gaps)
      key: undefined,
      isGap: true,
    });
  });

  it('resolveSistemaIntent: defensivo → null si empresa inexistente, sin empresa, o tree null', () => {
    expect(resolveSistemaIntent(tree, { empresa: 'fantasma', sistema: 'x' })).toBeNull();
    expect(resolveSistemaIntent(tree, {})).toBeNull();
    expect(resolveSistemaIntent(null, { empresa: 'vitalia' })).toBeNull();
  });
});
