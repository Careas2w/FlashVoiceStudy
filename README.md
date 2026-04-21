# Korean Flashstudy · GitHub Pages

Versión preparada para GitHub con audio híbrido gratuito:

- **Prioridad 1:** si existe `audios/NOMBRE-EXACTO.mp3`, la app reproduce ese MP3.
- **Prioridad 2:** si no existe el MP3, usa la síntesis de voz del navegador.
- **Priorización de voces del navegador:** intenta usar primero voces de más calidad/premium/natural disponibles en el dispositivo.
- **Sin perder funcionalidades:** se mantienen los botones, modos de estudio, reproducción lenta, tablas, filtros, edición, listas y resto de interacciones.

## Cómo usar tus audios

1. Sube tus MP3 dentro de la carpeta `audios/`.
2. Cada archivo debe llamarse exactamente igual que la palabra coreana.
   - `audios/학교.mp3`
   - `audios/안녕하세요.mp3`
   - `audios/기역.mp3`
3. Sube todo el contenido del ZIP al repositorio.

## Notas técnicas

- La búsqueda del MP3 se hace en `./audios/<palabra>.mp3`.
- Para palabras coreanas y botones de Hangul, primero se comprueba si existe el MP3.
- Si no está disponible, se reproduce con `speechSynthesis`.
- Todo funciona con tecnologías gratuitas del navegador y archivos estáticos, sin APIs de pago.
