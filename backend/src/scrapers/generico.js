// scrapers/generico.js
async function extraerGenerico(page) {
    await page.waitForTimeout(6000); 

    return await page.evaluate(() => {
        const limpiarPrecio = (texto) => {
            if (!texto) return null;
            // Quitamos todo menos números, puntos y comas
            const soloNumeros = texto.replace(/[^0-9]/g, '');
            if (!soloNumeros) return 0;

            // Lógica de decimales: Si termina en ,XX o .XX
            const tieneDecimales = /[,.][0-9]{2}$/.test(texto.trim());

            if (tieneDecimales) {
                const enteros = soloNumeros.slice(0, -2);
                const decimales = soloNumeros.slice(-2);
                return parseFloat(`${enteros}.${decimales}`);
            }

            return parseFloat(soloNumeros);
        };

        // Buscamos elementos que suelan tener el precio
        const elementos = Array.from(document.querySelectorAll('h1, h2, span, p, div, b, strong, .price, .precio'));
        
        // Filtramos y limpiamos
        const candidatos = elementos
            .map(el => el.innerText)
            .filter(t => t && t.includes('$') && /\d/.test(t) && t.length < 40)
            .map(t => limpiarPrecio(t))
            .filter(n => n > 0); // ¡IMPORTANTE! Si es 0, lo descartamos.

        if (candidatos.length > 0) {
            // En Maximus/FullHard, el precio más grande suele ser el de lista.
            // En este caso, tomamos el primero que sea mayor a 0.
            return { 
                precio: candidatos[0], 
                nombre: document.title,
                metodo: "Heurística Refinada"
            };
        }
        return { precio: null, nombre: document.title };
    });
}

module.exports = extraerGenerico;

// scrapers/generico.js
// async function extraerGenerico(page) {
//     await page.waitForTimeout(5000); 

//     return await page.evaluate(() => {
//         const limpiarPrecio = (texto) => {
//             if (!texto) return null;
//             const soloNumeros = texto.replace(/[^0-9]/g, '');
//             if (!soloNumeros) return 0;
//             const tieneDecimales = /[,.][0-9]{2}$/.test(texto.trim());
//             return tieneDecimales ? 
//                 parseFloat(`${soloNumeros.slice(0, -2)}.${soloNumeros.slice(-2)}`) : 
//                 parseFloat(soloNumeros);
//         };

//         const areaPrincipal = document.querySelector('main') || document.body;
//         const elementos = Array.from(areaPrincipal.querySelectorAll('h1, h2, span, p, div, b, strong, .price, .precio'));
        
//         const candidatos = elementos
//             .filter(el => {
//                 const txt = el.closest('section, div')?.innerText?.toLowerCase() || "";
//                 return !txt.includes('recomendado') && !txt.includes('vieron');
//             })
//             .map(el => (el.innerText?.includes('$') && /\d/.test(el.innerText)) ? limpiarPrecio(el.innerText) : null)
//             .filter(n => n > 5000); // Filtro para evitar ruidos de precios bajos

//         if (candidatos.length > 0) {
//             candidatos.sort((a, b) => a - b);
//             return { 
//                 precio: candidatos[0], 
//                 nombre: document.title,
//                 metodo: "Heurística de Área"
//             };
//         }
//         return { precio: null, nombre: document.title };
//     });
// }

// module.exports = extraerGenerico;