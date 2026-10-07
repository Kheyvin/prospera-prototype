// Modelo puro del pilar Personas (BL-01 · CK-12): inversos por scan
// (un-hecho-un-lugar) — quién cumple un rol, qué roles tiene una persona,
// qué procesos del diagnóstico corre un rol (match puesto↔rol.nombre).
import { describe, expect, it } from 'vitest';
import { quienesCumplen, rolesDePersona, procesosDelRol } from './personas';
import type { Persona, Rol } from './personas';
import type { Negocio } from './negocio';

const roles: Rol[] = [
  { id: 'rol-gerente', nombre: 'Gerente General' },
  { id: 'rol-analista', nombre: 'Analista de Cobranza' },
  { id: 'rol-vacante', nombre: 'Responsable Admin' },
];

const personas: Persona[] = [
  {
    id: 'per-ana',
    nombre: 'Ana',
    roles: [{ rol: 'rol-gerente' }, { rol: 'rol-analista' }],
  },
  { id: 'per-beto', nombre: 'Beto', roles: [{ rol: 'rol-analista' }] },
  { id: 'per-cata', nombre: 'Cata' }, // sin roles[] — válido (objeto.schema: opcional)
];

const negocio: Negocio = {
  empresa: 'vertice',
  titulo: 'Vértice',
  objetivos: [],
  areas: [
    {
      id: 'finanzas',
      nombre: 'Finanzas',
      procesos: [
        {
          id: 'pr-cobranza',
          nombre: 'Cobranza',
          sistema: 'odoo',
          digital: 'manual',
          obj: [],
          puesto: 'Analista de Cobranza',
        },
      ],
    },
    {
      id: 'comercial',
      nombre: 'Comercial',
      procesos: [
        {
          id: 'pr-ventas',
          nombre: 'Ventas',
          sistema: 'excel',
          digital: 'manual',
          obj: [],
          puesto: 'Analista de Cobranza',
        },
        // sin puesto — no matchea ningún rol (válido: puesto es opcional)
        { id: 'pr-post', nombre: 'Postventa', sistema: 'excel', digital: 'manual', obj: [] },
      ],
    },
  ],
};

describe('quienesCumplen', () => {
  it('devuelve las personas cuyo roles[] apunta al rol (inverso por scan)', () => {
    expect(quienesCumplen(personas, 'rol-analista').map((p) => p.id)).toEqual([
      'per-ana',
      'per-beto',
    ]);
    expect(quienesCumplen(personas, 'rol-gerente').map((p) => p.id)).toEqual(['per-ana']);
  });

  it('rol sin persona → [] (vacante o cumplido externamente)', () => {
    expect(quienesCumplen(personas, 'rol-vacante')).toEqual([]);
  });
});

describe('rolesDePersona', () => {
  it('resuelve los nombres contra roles/', () => {
    expect(rolesDePersona(personas[0], roles)).toEqual([
      'Gerente General',
      'Analista de Cobranza',
    ]);
  });

  it('persona sin roles[] → []', () => {
    expect(rolesDePersona(personas[2], roles)).toEqual([]);
  });

  it('ref colgante → devuelve el id crudo (delata en vez de ocultar)', () => {
    const p: Persona = { id: 'per-x', nombre: 'X', roles: [{ rol: 'rol-fantasma' }] };
    expect(rolesDePersona(p, roles)).toEqual(['rol-fantasma']);
  });
});

describe('procesosDelRol', () => {
  it('matchea puesto↔rol.nombre cruzando áreas y anota el área', () => {
    const got = procesosDelRol(negocio, roles[1]);
    expect(got.map((p) => `${p.id}@${p.area}`)).toEqual([
      'pr-cobranza@Finanzas',
      'pr-ventas@Comercial',
    ]);
  });

  it('rol que no corre procesos (o procesos sin puesto) → []', () => {
    expect(procesosDelRol(negocio, roles[0])).toEqual([]);
  });
});
