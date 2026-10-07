#!/usr/bin/env python3
"""test_gen_cobertura.py — TDD del verificador de cobertura (historia organizacion-ficticia-golden-fixture).

Patrón mutación: un universo sintético chico que cubre TODO un mini-contrato; cada test
REMUEVE una pieza (campo · valor de enum · arista · verbo · provenance) y espera el hueco
NOMBRADO. Además: smoke contra el schema real (shell vacío → huecos, exit 1).

Correr:  python3 -m unittest discover -s sistema/schema -p 'test_gen_cobertura.py'
"""
import copy
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import gen_cobertura as gc  # noqa: E402

# ---------- mini-contrato sintético (2 entidades · 1 weak · 2 enums · 2 aristas) ----------
MINI_SCHEMA = {
    "enums": {
        "color": ["rojo", "verde"],
        "fuente": ["Entrevista", "Declarado", "Sistema leído", "Observado", "Inferido"],
        "conf": ["alta", "media", "baja"],
    },
    "nodos": {
        "cosa": {
            "archivo": "cosas/co-*.yaml",
            "campos": {
                "id": {"tipo": "str", "requerido": True},
                "tono": {"tipo": "enum", "enum": "color", "requerido": False},
                "amiga_ref": {"tipo": "ref", "a": "cosa", "requerido": False},
                "partes": {"tipo": "list", "requerido": False, "subesquema": "parte"},
                "fuente": {"tipo": "enum", "enum": "fuente", "requerido": False},
                "conf": {"tipo": "enum", "enum": "conf", "requerido": False},
            },
            "subesquemas": {
                "parte": {
                    "id": {"tipo": "str", "requerido": True},
                    "peso": {"tipo": "num", "requerido": False},
                    "otra_ref": {"tipo": "ref", "a": "otra", "requerido": False},
                },
            },
        },
        "otra": {
            "archivo": "otras/ot-*.yaml",
            "campos": {
                "id": {"tipo": "str", "requerido": True},
                "cosa_ref": {"tipo": "ref", "a": "cosa", "requerido": False},
            },
        },
    },
    "relaciones": [
        {"de": "cosa", "a": "cosa", "dueño": "cosa.amiga_ref"},
        {"de": "otra", "a": "cosa", "dueño": "otra.cosa_ref"},
        # arista ANIDADA (2 segmentos por lista) + COMPUESTA `+` (2ª parte resuelve en la raíz)
        {"de": "cosa", "a": "otra", "dueño": "cosa.partes.otra_ref+amiga_ref"},
    ],
}

# instancias que cubren TODO el mini-contrato
MINI_FULL = {
    "cosa": [
        {"id": "co-a", "tono": "rojo", "amiga_ref": "co-b",
         "partes": [{"id": "co-a#p1", "peso": 3, "otra_ref": "ot-x"}],
         "fuente": "Entrevista", "conf": "alta"},
        {"id": "co-b", "tono": "verde", "fuente": "Observado", "conf": "media"},
        {"id": "co-c", "tono": "rojo", "fuente": "Sistema leído", "conf": "alta"},
        {"id": "co-d", "tono": "verde", "fuente": "Inferido", "conf": "baja"},
        {"id": "co-e", "tono": "rojo", "fuente": "Declarado", "conf": "media"},
    ],
    "otra": [{"id": "ot-x", "cosa_ref": "co-a"}],
}


def quitar(instancias, entidad, campo):
    out = copy.deepcopy(instancias)
    for inst in out[entidad]:
        inst.pop(campo, None)
    return out


class TestCobertura(unittest.TestCase):
    def setUp(self):
        self.contrato = gc.indexar_contrato(MINI_SCHEMA)

    def test_universo_completo_cero_huecos(self):
        r = gc.cobertura(self.contrato, {"mini": MINI_FULL})
        self.assertEqual(r.huecos_campos, [])
        self.assertEqual(r.huecos_enums, [])
        self.assertEqual(r.huecos_aristas, [])

    def test_mutacion_campo_nombra_el_hueco(self):
        inst = quitar(MINI_FULL, "cosa", "partes")
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("cosa.partes", r.huecos_campos)
        self.assertIn("cosa.parte.id", r.huecos_campos)      # subesquema cae con el padre
        self.assertIn("cosa.parte.peso", r.huecos_campos)

    def test_mutacion_subcampo_nombra_el_hueco(self):
        inst = copy.deepcopy(MINI_FULL)
        for p in inst["cosa"][0]["partes"]:
            p.pop("peso")
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("cosa.parte.peso", r.huecos_campos)
        self.assertNotIn("cosa.partes", r.huecos_campos)

    def test_enum_excluido_no_se_mide(self):
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            if c.get("tono") == "verde":
                c["tono"] = "rojo"                            # verde queda sin ejercer…
        r = gc.cobertura(self.contrato, {"mini": inst}, enums_excluidos={"color"})
        self.assertNotIn("color=verde", r.huecos_enums)       # …pero color está excluido

    def test_mutacion_enum_nombra_valor(self):
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            if c.get("tono") == "verde":
                c["tono"] = "rojo"
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("color=verde", r.huecos_enums)

    def test_mutacion_arista_nombra_dueño(self):
        inst = quitar(MINI_FULL, "otra", "cosa_ref")
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("otra.cosa_ref", r.huecos_aristas)
        self.assertIn("otra.cosa_ref", r.huecos_campos)      # también es campo

    def test_arista_anidada_y_compuesta(self):
        # quitar otra_ref del sub-item → la arista compuesta cae (aunque amiga_ref siga viva)
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            for p in c.get("partes") or []:
                p.pop("otra_ref", None)
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("cosa.partes.otra_ref+amiga_ref", r.huecos_aristas)
        # y al revés: quitar amiga_ref también la tumba (compuesto exige AMBAS partes)
        inst2 = quitar(MINI_FULL, "cosa", "amiga_ref")
        r2 = gc.cobertura(self.contrato, {"mini": inst2})
        self.assertIn("cosa.partes.otra_ref+amiga_ref", r2.huecos_aristas)

    def test_campo_vacio_no_cuenta(self):
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            if "partes" in c:
                c["partes"] = []                              # presente pero vacío = NO cubierto
        r = gc.cobertura(self.contrato, {"mini": inst})
        self.assertIn("cosa.partes", r.huecos_campos)

    def test_scope_por_entidades_presentes(self):
        # modo área: si un tipo no tiene instancias en scope, sus campos NO se exigen
        inst = {"cosa": MINI_FULL["cosa"], "otra": []}
        r = gc.cobertura(self.contrato, {"mini": inst}, exigir_solo_tipos_presentes=True)
        self.assertTrue(all(not h.startswith("otra.") for h in r.huecos_campos))
        self.assertIn("otra.cosa_ref", r.huecos_aristas)      # la arista sí queda visible como no ejercida


class TestProvenance(unittest.TestCase):
    def setUp(self):
        self.contrato = gc.indexar_contrato(MINI_SCHEMA)

    def test_full_pasa_reglas(self):
        v = gc.provenance_violaciones(MINI_FULL, min_fuentes=4, max_share=0.70)
        self.assertEqual(v, [])

    def test_inferido_alta_prohibido(self):
        inst = copy.deepcopy(MINI_FULL)
        inst["cosa"][3]["conf"] = "alta"                      # Inferido+alta
        v = gc.provenance_violaciones(inst, min_fuentes=4, max_share=0.70)
        self.assertTrue(any("Inferido" in x and "alta" in x for x in v))

    def test_pocas_fuentes(self):
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            c["fuente"] = "Declarado"
        v = gc.provenance_violaciones(inst, min_fuentes=4, max_share=0.70)
        self.assertTrue(any("fuentes" in x for x in v))

    def test_monocultivo_share(self):
        inst = copy.deepcopy(MINI_FULL)
        for c in inst["cosa"]:
            c["fuente"], c["conf"] = "Declarado", "alta"
        inst["cosa"].append({"id": "co-e", "fuente": "Entrevista", "conf": "media"})
        inst["cosa"].append({"id": "co-f", "fuente": "Observado", "conf": "media"})
        inst["cosa"].append({"id": "co-g", "fuente": "Sistema leído", "conf": "media"})
        v = gc.provenance_violaciones(inst, min_fuentes=4, max_share=0.55)
        self.assertTrue(any("share" in x or ">" in x for x in v))


class TestVerbos(unittest.TestCase):
    def test_verbo_faltante_nombrado(self):
        verbos = ["medir", "aprobar"]
        actividades = [{"verbo": "medir"}]
        faltan = gc.verbos_sin_usar(verbos, actividades)
        self.assertEqual(faltan, ["aprobar"])


class TestAristasReales(unittest.TestCase):
    """Los `dueño:` del schema REAL deben resolverse (paths + alias weak + compuestos `+`)."""

    def test_todos_los_dueños_resuelven_o_se_declaran_informales(self):
        schema = gc.load_yaml(gc.RAIZ / "objeto.schema.yaml")
        contrato = gc.indexar_contrato(schema)
        # ninguna arista pierde silenciosamente: o es medible o está en informales declaradas
        medibles = {a["dueño"] for a in contrato.aristas}
        informales = set(contrato.aristas_informales)
        todas = {str(r.get("dueño")) for r in schema.get("relaciones", [])}
        self.assertEqual(medibles | informales, todas)
        self.assertIn("la carpeta (partición)", informales)
        self.assertGreaterEqual(len(medibles), 20)


class TestFiltrarArea(unittest.TestCase):
    """El scope de --area debe seguir el CONTRATO del schema (finding Audit B):
    brecha.against_ref admite capability|proceso|sistema|objetivo."""

    def test_brecha_contra_capability_entra_al_scope(self):
        datos = {
            "empresa": [{"id": "e"}],
            "area": [{"id": "a1", "nombre": "Finanzas"}],
            "proceso": [{"id": "p1", "areas_ref": ["a1"], "realiza_capabilities": ["c1"],
                         "sistemas_ref": ["s1"],
                         "actividades": [{"id": "p1#a1", "sistemas_ref": ["s2"],
                                          "raci": {"A": "r2", "R": ["r2"]}}]}],
            "capability": [{"id": "c1"}],
            "sistema": [{"id": "s1"}, {"id": "s2"}],
            "rol": [{"id": "r1"}, {"id": "r2"}],
            "kpi": [], "persona": [], "objetivo": [], "proyecto_mejora": [], "idea": [],
            "brecha": [{"id": "b1", "against_ref": "c1"},
                       {"id": "b2", "against_ref": "s1"}],
        }
        datos["area"][0]["lider_ref"] = "r1"
        out = gc.filtrar_area(datos, "a1")
        ids_b = {b["id"] for b in out["brecha"]}
        self.assertEqual(ids_b, {"b1", "b2"})                 # capability Y sistema como targets
        self.assertEqual({s["id"] for s in out["sistema"]}, {"s1", "s2"})  # sistemas_ref de actividad también
        self.assertEqual({r["id"] for r in out["rol"]}, {"r1", "r2"})      # lider_ref + RACI


class TestCLISmoke(unittest.TestCase):
    def test_shell_vacio_exit_1_y_nombra_huecos(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / "empresa").mkdir()
            p = subprocess.run(
                [sys.executable, str(gc.RAIZ / "gen_cobertura.py"), "--shell", td],
                capture_output=True, text=True)
            self.assertEqual(p.returncode, 1, p.stdout + p.stderr)
            self.assertIn("huecos", p.stdout)


if __name__ == "__main__":
    unittest.main()
