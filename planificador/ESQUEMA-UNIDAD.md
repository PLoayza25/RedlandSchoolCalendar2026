# Redland School · Planificador de unidad: formato de salida

Este directorio genera el **planificador interactivo en HTML** (un único archivo que funciona sin conexión, con las vistas Mapa de la unidad, Preparar sesión, Usar en clase, Recursos, Marco curricular y Cómo usar) a partir de los datos de una unidad en JSON.

| Archivo | Para qué sirve |
|---|---|
| `generar-planificador.js` | El generador. Ya trae la plantilla dentro; es el único archivo que necesita la app. |
| `plantilla.html` | La plantilla, para consultarla o editarla (marcador `__UNIT_DATA__`). |
| `ejemplo-unidad.json` | La unidad "Poder, perspectiva y lenguaje" completa en este formato. |

## Uso

**En la app (navegador):**
```html
<script src="generar-planificador.js"></script>
<script>
  // unidad = objeto con el formato de abajo
  descargarPlanificador(unidad);              // descarga Planificador_<Titulo>.html
  const html = generarPlanificador(unidad);   // o bien obtener el HTML como texto
</script>
```

**Desde la terminal:**
```bash
node planificador/generar-planificador.js planificador/ejemplo-unidad.json salida.html
```

## Formato de la unidad (JSON)

Obligatorio: `title` y `sessions` (al menos una sesión). Todo lo demás es opcional y se completa con valores por defecto.

```jsonc
{
  "title": "Poder perspectiva y lenguaje",
  "headline": "Quién tiene poder decide qué se dice y cómo",   // titular del mapa; si falta, se usa title
  "subtitle": "Lengua y Literatura · 8.º básico · 24 sesiones · 6 semanas", // si falta, se arma con meta + nº de sesiones/semanas
  "referenceNotice": "Texto de aviso en Marco curricular",      // opcional

  "meta": {                     // pares libres "etiqueta": "valor"
    "Profesor(es)": "…", "Grupo de asignaturas": "Lenguaje", "Año del PAI": "8° Básico",
    "Duración de la unidad": "…", "Horario semanal de la clase": "…"
  },

  "curriculum": {               // estas claves se usan en el Mapa de la unidad:
    "Concepto clave": "Perspectiva",
    "Conceptos relacionados": "Punto de vista, Propósito",   // separados por comas
    "Contexto global": "Equidad y desarrollo",
    "Exploración": "Poder y privilegio",
    "Enunciado de la indagación": "…",
    "Preguntas de indagación": "Fáctica 1: …\nConceptual 1: …",
    "Evaluación sumativa": "…"
    // se pueden añadir más claves libres (Objetivos MYP, OA MINEDUC, ATL, …)
  },

  "supports": {
    "Diferenciación (estrategias para bajar barreras)": "…"  // aparece en cada sesión
  },

  "sessions": [
    {
      "id": 1,                  // número entero único
      "week": 1, "day": "Lunes", "minutes": 80,
      "objective": "Aprendizaje de la clase",
      "mode": "práctica guiada",
      "codes": "A1, A2",        // aspectos/criterios trabajados
      "header": "Sesión 1 · Semana 1 · Lunes · 80 min …",  // referencia original (opcional)
      "summative": false,       // opcional: true marca la sesión como evaluación sumativa
                                // (si falta, se detecta si objective/mode dice "evaluación sumativa")
      "extras": {               // claves reconocidas:
        "Materiales sugeridos": "…",
        "Evidencia individual esperada": "…"
        // cualquier otra clave aparece en "Conexión conceptual y retroalimentación"
      },
      "activities": [
        {
          "id": "S1-A1",        // único en toda la unidad (si falta: S<sesión>-A<n>)
          "phase": "Conectar y cuestionar",
          "minutes": 10,
          "text": "Descripción de la actividad",
          "details": ["Orientación o recurso 1", "Respuesta modelo …"],  // desplegable
          "resourceLink": ""    // opcional, https://…
        }
      ]
    }
  ],

  "annex": [                    // Marco curricular (opcional)
    { "title": "Matriz de trazabilidad",
      "rows": [ ["Subtítulo"], ["Etiqueta", "valor 1", "valor 2"] ] }   // fila de 1 elemento = subtítulo
  ]
}
```

Los campos de seguimiento (`status`, `note`, `date`) los añade el generador vacíos; luego el docente los completa dentro del planificador.

## Recursos de cada sesión (archivos)

En **Preparar sesión**, el botón **Subir archivos** (o arrastrar al recuadro) adjunta PowerPoint, Word, PDF, Excel, imágenes o audio/vídeo a la sesión.

- **Chrome / Edge:** la primera vez se elige la *carpeta de recursos de la unidad*. Cada archivo se copia a `Sesion_NN/` dentro de esa carpeta, y el planificador recuerda la carpeta en ese navegador. Conviene guardar el HTML y la carpeta juntos en Drive u OneDrive; en otro equipo basta con pulsar **Elegir carpeta** y seleccionar la misma.
- **Firefox / Safari:** no permiten escribir en carpetas; los archivos se guardan dentro del navegador (aviso visible en la sesión).
- **Abrir:** PDF, imágenes, audio y vídeo se ven dentro del planificador (con opción de pestaña nueva); PowerPoint, Word y Excel se descargan para abrirse con su programa.
- En **Usar en clase** solo aparece el botón **Abrir**; quitar y descargar quedan en Preparar sesión. La vista **Recursos** lista todos los archivos de la unidad.

El planificador anota cada archivo en `resources` (la app no necesita enviarlo; si lo envía, se conserva):

```jsonc
"resources": [
  { "id": "R…", "session": 3, "name": "Presentación clase 3.pptx", "path": "Sesion_03/Presentación clase 3.pptx",
    "size": 30000, "type": "…", "added": "2026-11-09", "store": "carpeta" }   // store: "carpeta" | "navegador"
]
```

## Texto para pegar en el chat de la app

> Añade a la app un botón **"Descargar planificador interactivo"**. Al pulsarlo, convierte la unidad actual al formato JSON descrito en `ESQUEMA-UNIDAD.md` y llama a `descargarPlanificador(unidad)` de `generar-planificador.js` (incluido como `<script>` o pegado dentro de la app). Mapea cada sesión y cada actividad de la app a `sessions[]` y `activities[]`; usa las claves de `curriculum` exactamente como aparecen en el esquema.

## Modificar el diseño

Edita `plantilla.html` (o `generador-base.js`) y ejecuta `node planificador/construir.js` para regenerar `generar-planificador.js`.
