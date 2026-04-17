if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.warn('No se pudo registrar el service worker:', err);
        });
    });
}

/**
 * Reemplazo de la función de voz para usar MP3 locales.
 * Busca archivos en la carpeta /audio/ con el nombre exacto de la palabra + .mp3
 */
window.speak = function(text, lang = "ko-KR", rate = 1.0) {
    if (!text) return;
    
    const cleanText = text.trim();
    // Codificamos el nombre para que funcione con caracteres coreanos en la URL
    const audioUrl = `./audio/${encodeURIComponent(cleanText)}.mp3`;
    
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    
    audio.play().catch(err => {
        console.warn(`[Audio] No se encontró el archivo: ${audioUrl}`);
        // Fallback silencioso para no interrumpir el flujo de estudio
    });
};
