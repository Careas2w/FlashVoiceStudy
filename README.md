# Korean Flashstudy · ZIP limpio final

Este paquete corrige:
- botón 🗣 Voz operativo
- modal de configuración de voz
- integración con Cloudflare Worker + Edge TTS
- fallback a voz local
- rutas de iconos correctas dentro de `icons/`
- service worker más tolerante a fallos de caché

## Qué subir al repo web
- index.html
- app.js
- sw.js
- manifest.webmanifest
- README.md
- carpeta icons/

## Qué NO debe estar en el repo web
- package.json
- wrangler.jsonc
- worker.js
