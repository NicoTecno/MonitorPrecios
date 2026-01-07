// scrapers/tiendamia.js
async function extraerTiendamia(page) {
    try {
        // Esperamos a que el contenedor principal esté presente
        await page.waitForSelector('body', { timeout: 10000 });
        
        // Simulamos un pequeño scroll para activar scripts de carga
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(4000); // Tiempo para que el JS de Tiendamia dibuje el precio

        return await page.evaluate(() => {
            // Buscamos directamente por la clase que confirmamos en el inspector
            const elPrecio = document.querySelector('.item-price-main');
            const elTachado = document.querySelector('.item-price-crossed');
            const elNombre = document.querySelector('.product-name h1') || document.querySelector('h1');

            if (!elPrecio || !elPrecio.innerText.includes('$')) {
                return null;
            }

            const limpiar = (t) => t ? parseFloat(t.replace(/[^0-9]/g, '')) : null;

            return {
                nombre: elNombre ? elNombre.innerText.trim() : document.title,
                precio: limpiar(elPrecio.innerText),
                precioOriginal: limpiar(elTachado?.innerText),
                metodo: "Especialista Tiendamia (Clase Verificada)"
            };
        });
    } catch (e) {
        return null;
    }
}

module.exports = extraerTiendamia;