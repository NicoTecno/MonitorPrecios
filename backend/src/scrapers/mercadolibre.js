// scrapers/mercadolibre.js
async function extraerMeLi(page) {
    // 1. Esperamos a que el título cargue (esto confirma que entramos a la página)
    await page.waitForSelector('h1.ui-pdp-title', { timeout: 10000 });

    const datos = await page.evaluate(() => {
        // Buscamos el precio en el meta tag (es lo más exacto)
        const metaPrice = document.querySelector('meta[itemprop="price"]')?.content;
        
        // Buscamos el nombre
        const title = document.querySelector('h1.ui-pdp-title')?.innerText;

        // Si el meta falló, buscamos el texto visual
        let precioFinal = metaPrice;
        if (!precioFinal) {
            const visualPrice = document.querySelector('.andes-money-amount__fraction')?.innerText;
            // Limpiamos el punto de miles: "15.400" -> "15400"
            precioFinal = visualPrice ? visualPrice.replace(/\./g, '') : null;
        }

        return {
            precio: precioFinal ? parseFloat(precioFinal) : null,
            nombre: title || "Producto desconocido"
        };
    });

    if (!datos.precio) throw new Error("No encontré el precio en MeLi");
    return datos;
}

module.exports = extraerMeLi;