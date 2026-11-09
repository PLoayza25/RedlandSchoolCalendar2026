// Regenera generar-planificador.js después de editar plantilla.html o generador-base.js:
//   node planificador/construir.js
const fs = require('fs'), path = require('path'), d = __dirname;
const plantilla = fs.readFileSync(path.join(d, 'plantilla.html'), 'utf8');
if (!plantilla.includes('__UNIT_DATA__')) throw new Error('plantilla.html debe contener __UNIT_DATA__');
const base = fs.readFileSync(path.join(d, 'generador-base.js'), 'utf8');
fs.writeFileSync(path.join(d, 'generar-planificador.js'), base.replace('__PLANTILLA__', () => JSON.stringify(plantilla)));
console.log('generar-planificador.js actualizado');
