require('dotenv').config();
const { chromium } = require('playwright');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');
const extraerMeLi = require('./scrapers/mercadolibre');
const extraerTiendamia = require('./scrapers/tiendamia');
const extraerGenerico = require('./scrapers/generico');

// ============================================================
// 🤖 VINCULACIÓN DE USUARIOS
// ============================================================
bot.start((ctx) => {
    ctx.reply('👋 ¡Hola! Vinculá tu cuenta escribiendo:\n\n/vincular tu@email.com');
});

bot.command('vincular', async (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email) return ctx.reply('⚠️ Usá: /vincular tu@email.com');

    try {
        const usuario = await Usuario.findOneAndUpdate(
            { email: email.toLowerCase() },
            { telegramId: ctx.from.id.toString() },
            { new: true }
        );
        if (usuario) ctx.reply(`✅ ¡Vinculado con éxito, ${usuario.nombre}!`);
        else ctx.reply('❌ Email no encontrado.');
    } catch (err) { ctx.reply('🔥 Error al vincular.'); }
});

bot.launch().then(() => console.log("🤖 Bot escuchando..."));

// ============================================================
// 🔍 MOTOR DE PRECIOS (CON LIMPIEZA ANT-TRILLONES)
// ============================================================
async function actualizarUnProducto(productoId) {
    let browser;
    try {
        const productoDoc = await Producto.findById(productoId);
        if (!productoDoc) return;

        browser = await chromium.launch({ headless: true });
        const page = await (await browser.newContext()).newPage();
        
        await page.goto(productoDoc.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        let resultado = null;
        const url = productoDoc.url;

        // Usamos tus scrapers actuales
        if (url.includes('mercadolibre.com.ar')) {
            resultado = await extraerMeLi(page);
        } else if (url.includes('tiendamia.com')) {
            resultado = await extraerTiendamia(page);
        } else {
            resultado = await extraerGenerico(page);
        }

        if (resultado && resultado.precio) {
            // --- PARCHE DE SEGURIDAD PARA COMPRAGAMER / GENÉRICO ---
            // Si el precio es absurdamente alto (más de 50 millones), 
            // nos quedamos solo con la primera mitad del número.
            let precioFinal = resultado.precio;
            let precioStr = precioFinal.toString();
            
            if (precioStr.length > 9) { 
                // Esto corta el número si se pegaron dos precios (ej: 800000900000)
                precioFinal = parseInt(precioStr.substring(0, precioStr.length / 2));
            }

            // Conversión Tiendamia (1 USD = 1500 ARS)
            if (url.includes('tiendamia.com')) {
                precioFinal = precioFinal * 1500;
            }

            const precioAnterior = productoDoc.ultimoPrecio;
            productoDoc.nombre = resultado.nombre || productoDoc.nombre;
            productoDoc.ultimoPrecio = precioFinal;
            productoDoc.historial.push({ precio: precioFinal });
            await productoDoc.save();

            // NOTIFICACIÓN MULTI-USUARIO
            if (precioAnterior > 0 && precioFinal < precioAnterior) {
                const interesados = await Usuario.find({
                    'misSeguimientos.producto': productoDoc._id,
                    'misSeguimientos.precioAlerta': { $gte: precioFinal }
                });

                for (const u of interesados) {
                    const targetId = u.telegramId || process.env.TELEGRAM_CHAT_ID;
                    if (targetId) {
                        const mensaje = `📉 *BAJA DE PRECIO* 📉\n\n📦 *${productoDoc.nombre}*\n💰 *Ahora:* $${precioFinal.toLocaleString('es-AR')}\n🔗 [VER](${productoDoc.url})`;
                        try { await bot.telegram.sendMessage(targetId, mensaje, { parse_mode: 'Markdown' }); } catch (e) {}
                    }
                }
            }
        }
    } catch (e) { console.error("Error:", e.message); }
    finally { if (browser) await browser.close(); }
}

module.exports = { actualizarUnProducto };