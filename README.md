# Korean Flashstudy · GitHub Pages

Versión preparada para GitHub con **audio híbrido gratuito**:

- **Prioridad 1 (coreano):** intenta reproducir un MP3 local con el nombre exacto de la palabra.
- **Prioridad 2:** si no encuentra/puede reproducir el MP3, usa la síntesis de voz del navegador (como antes).
- **Voces premium:** en el fallback del navegador se priorizan voces más naturales/premium cuando estén disponibles.

## Dónde poner tus MP3

La app busca (en este orden) estos paths:

1. `audios/<PALABRA>.mp3` *(recomendado)*
2. `audio/<PALABRA>.mp3` *(alternativo)*
3. `<PALABRA>.mp3` *(en la raíz del repo)*

Ejemplos:

- `audios/학교.mp3`
- `audios/안녕하세요.mp3`
- `audios/기역.mp3`

## Notas importantes

- Los nombres deben coincidir **exactamente** con el texto de la app (la palabra coreana).  
  Para evitar problemas de normalización Unicode (NFC/NFD), la app también prueba variantes automáticamente.
- Si probaste antes de subir los MP3, el service worker podía haber guardado un 404 en caché.  
  Solución rápida: pulsa el botón **🔄 Actualizar la web** dentro de la app (limpia caché y recarga).

Todo funciona con tecnologías gratuitas del navegador y archivos estáticos (sin APIs de pago).


**Corrección importante:** la reproducción prioriza MP3 y **evita** que el MP3 y la síntesis de voz se reproduzcan a la vez.


Nota: siempre se intenta el MP3 primero (aunque antes faltara), y solo si falla se usa la voz del navegador.
