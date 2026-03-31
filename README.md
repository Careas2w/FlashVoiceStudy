# Korean Flashstudy · Edge TTS listo

Esta versión añade una opción de voz más natural usando **Cloudflare Worker + Edge TTS**.

## Qué he dejado preparado
- Botón **🗣 Voz** dentro de la app.
- Configuración guardada en el navegador.
- Fallback automático a la voz del dispositivo si el Worker falla.
- Worker listo en la carpeta `cloudflare-worker`.
- Soporte para voz coreana y española.
- Endpoint compatible con `POST /v1/audio/speech`.

## Lo único que tienes que hacer tú
1. Subir esta app a GitHub Pages.
2. Desplegar el Worker de la carpeta `cloudflare-worker` en Cloudflare.
3. Copiar la URL pública del Worker.
4. En la app:
   - pulsa **🗣 Voz**
   - elige **Cloudflare Worker + Edge TTS**
   - pega la URL del Worker
   - guarda
   - prueba la voz

## Nota importante
Edge TTS no es una API comercial oficial de pago. Esta solución no requiere pagar API keys, pero puede cambiar o limitarse si Microsoft modifica el servicio.
