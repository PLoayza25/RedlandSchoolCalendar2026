/*
 * Redland School · Generador del Planificador de unidad (HTML interactivo)
 *
 * Uso en el navegador (app del planificador):
 *   <script src="generar-planificador.js"></script>
 *   const html = generarPlanificador(unidad);          // string con el HTML completo
 *   descargarPlanificador(unidad);                     // descarga Planificador_<titulo>.html
 *
 * Uso en Node:
 *   node generar-planificador.js unidad.json [salida.html]
 *
 * El formato de "unidad" está descrito en ESQUEMA-UNIDAD.md.
 */
(function (root) {
  'use strict';
  const PLANTILLA = __PLANTILLA__;

  function slug(t) {
    return String(t || 'unidad').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'unidad';
  }

  // Completa campos opcionales y comprueba lo imprescindible.
  function normalizarUnidad(u) {
    if (!u || typeof u !== 'object') throw new Error('La unidad debe ser un objeto.');
    if (!u.title) throw new Error('Falta "title".');
    if (!Array.isArray(u.sessions) || !u.sessions.length) throw new Error('"sessions" debe tener al menos una sesión.');
    const ids = new Set();
    const sessions = u.sessions.map((s, i) => {
      const id = Number.isInteger(s.id) ? s.id : i + 1;
      if (ids.has(id)) throw new Error('Sesión repetida: ' + id);
      ids.add(id);
      const acts = (s.activities || []).map((a, j) => {
        const aid = String(a.id || `S${id}-A${j + 1}`);
        if (ids.has(aid)) throw new Error('Actividad repetida: ' + aid);
        ids.add(aid);
        const min = Number(a.minutes);
        return {
          id: aid, phase: String(a.phase || 'Actividad'), minutes: Number.isFinite(min) && min > 0 ? min : 10,
          text: String(a.text || ''), details: (a.details || []).map(String),
          status: a.status || 'Pendiente', note: a.note || '', resourceLink: a.resourceLink || ''
        };
      });
      const out = {
        id, week: s.week ?? '', day: s.day || '',
        minutes: Number(s.minutes) || acts.reduce((n, a) => n + a.minutes, 0),
        header: s.header || '', objective: s.objective || '', mode: s.mode || '', codes: s.codes || '',
        activities: acts, extras: s.extras || {}, note: s.note || '', date: s.date || ''
      };
      if (typeof s.summative === 'boolean') out.summative = s.summative;
      return out;
    });
    return Object.assign({}, u, {
      version: 1, meta: u.meta || {}, curriculum: u.curriculum || {}, supports: u.supports || {},
      annex: u.annex || [], sessions
    });
  }

  function generarPlanificador(unidad) {
    const u = normalizarUnidad(unidad);
    // "<" escapado para que ningún texto pueda cerrar el <script> de datos.
    const json = JSON.stringify(u).replace(/</g, '\\u003c');
    return PLANTILLA.replace('__UNIT_DATA__', () => json);
  }

  function nombreArchivo(unidad) { return 'Planificador_' + slug(unidad && unidad.title) + '.html'; }

  function descargarPlanificador(unidad) {
    const blob = new Blob([generarPlanificador(unidad)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nombreArchivo(unidad); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const api = { generarPlanificador, descargarPlanificador, normalizarUnidad, nombreArchivo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);

  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const fs = require('fs'), [, , entrada, salida] = process.argv;
    if (!entrada) { console.error('Uso: node generar-planificador.js unidad.json [salida.html]'); process.exit(1); }
    const unidad = JSON.parse(fs.readFileSync(entrada, 'utf8'));
    const destino = salida || nombreArchivo(unidad);
    fs.writeFileSync(destino, generarPlanificador(unidad));
    console.log('Generado: ' + destino);
  }
})(typeof window !== 'undefined' ? window : globalThis);
