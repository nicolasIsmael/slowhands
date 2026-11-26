# SlowHands

[Read in English](README.md)

SlowHands es una aplicación web moderna, de código abierto y «local primero» (PWA) que ayuda a
practicar piano con tus propias partituras MusicXML: dividir una pieza en secciones, practicar
cada mano por separado, bajar el tempo, repetir pasajes, recibir sugerencias de digitación y
puntuar una interpretación con un teclado MIDI o el micrófono.

La primera funcionalidad de este repositorio es la **biblioteca de canciones y el visor de
partituras**: importa archivos MusicXML (`.musicxml`, `.xml`, `.mxl`), guárdalos en tu
dispositivo y léelos en un teléfono apoyado junto al piano, con o sin internet.

## Principios

- **Local primero y privado**: sin cuentas ni telemetría. Las partituras nunca salen de tu
  dispositivo.
- **Sin conexión**: tras la primera visita todo funciona sin internet.
- **Móvil primero**: pensada primero para el teléfono (Android Chrome) y escalada a escritorio.
- **Inglés y español**: la interfaz sigue el idioma del dispositivo y se puede cambiar.

## Tecnologías

TypeScript, React 19, Vite 8, Tailwind CSS 4, shadcn/ui, i18next, OpenSheetMusicDisplay, Dexie
(IndexedDB), vite-plugin-pwa, Vitest, Testing Library y Playwright. Cada elección está
registrada en [docs/adr](docs/adr/README.md) (en inglés).

## Primeros pasos

Requisitos: Node.js 24 y pnpm 12.

```sh
pnpm install
pnpm hooks:install   # activa la comprobación de mensajes de commit
pnpm dev             # inicia el servidor de desarrollo
```

| Comando | Qué hace |
|---------|----------|
| `pnpm check` | Tipos, lint, comprobaciones del repositorio y pruebas unitarias; ejecútalo antes de cada commit |
| `pnpm test` | Pruebas unitarias y de componentes |
| `pnpm build && pnpm test:e2e` | Compilación de producción y los flujos en navegador |

## Estructura de carpetas

```text
src/
  core/       dominio puro: sin DOM, sin React, sin paquetes de terceros, sin textos de interfaz
    score/  library/  import/  viewer/  settings/  app/
    time/  identity/  reactive/  bytes/    (interfaces y utilidades pequeñas)
  engines/    adaptadores que implementan interfaces del core (lectura, dibujo, workers, navegador)
    score-parsing/  score-worker/  osmd-renderer/  browser-files/  browser-platform/
  storage/    base de datos, esquema, migraciones y repositorios
    database/  library/  settings/
  ui/         componentes React, pantallas, traducciones y la raíz de composición
    app/  library/  import/  viewer/  settings/  pwa/  i18n/  primitives/  styling/  testing/
e2e/          pruebas en navegador: flows/ y objetos de página en pages/
fixtures/     partituras de ejemplo usadas por las pruebas (escritas para este proyecto, MIT como el código)
public/       iconos de la aplicación instalable
docs/adr/     registros de decisiones de arquitectura y su índice
tooling/      comprobaciones del repositorio y plugin de lint
```

Las dependencias van en un solo sentido: `ui` hacia `engines` y `storage`, y estos hacia
`core`. `engines` y `storage` nunca se importan entre sí. El lint lo verifica.

## Reglas en breve

- Los archivos no superan 200 líneas y las funciones 25 líneas; se divide en lugar de excederlo.
- Los módulos se nombran por lo que hacen; no hay carpetas «utils» ni «helpers».
- El código del core tiene pruebas, escritas primero; los flujos de usuario tienen pruebas en
  navegador.
- Cada decisión importante tiene un registro de decisión de arquitectura; las dependencias nuevas
  se justifican por escrito y usan licencias permisivas (MIT, BSD, Apache-2.0, ISC) o LGPL.
- Los commits siguen Conventional Commits, en inglés.

## Alojamiento y uso sin conexión

La aplicación es un sitio estático, así que sirve cualquier alojamiento estático, siempre que
use HTTPS (los service workers y el almacenamiento persistente lo necesitan; `localhost` queda
exento).

- Sirve `index.html` y `sw.js` con `Cache-Control: no-cache` para que se note una versión nueva.
  Los archivos de `assets/` tienen nombres con hash y pueden guardarse en caché mucho tiempo.
- La primera visita debe tener conexión. Después, la aplicación y cada canción importada
  funcionan sin conexión. Las canciones viven en el almacenamiento del navegador del dispositivo
  y nada se envía a ningún sitio.
- En Chrome para Android la aplicación se instala con su botón «Instalar aplicación», o desde el
  menú del navegador, y se abre como cualquier otra, en la lista de canciones.
- Una versión nueva se ofrece con el botón «Actualizar ahora» y nunca se aplica durante una
  importación.
- El funcionamiento sin conexión solo existe en la compilación de producción: usa
  `node --run build` y `node --run preview`, no el servidor de desarrollo.

## Lista de verificación de lanzamiento

Antes del primer despliegue accesible públicamente o de la primera versión publicada debe
existir la exportación e importación de proyectos.
