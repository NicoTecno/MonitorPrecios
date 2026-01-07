require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron'); // 1. Importamos node-cron
const app = express();

// --- MODELOS ---
const Usuario = require('./src/models/Usuario');
const Producto = require('./src/models/Producto');

// --- MOTOR (SCRAPER) ---
const { actualizarUnProducto } = require('./src/motor'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ API conectada a MongoDB"))
    .catch(err => console.error("❌ Error de conexión:", err));

// --- ⏰ CRON JOB: Tarea Automática Diaria ---
// Se ejecuta todos los días a las 09:00 AM
// El formato es: (minuto hora díaMes mes díaSemana)
cron.schedule('0 9 * * *', async () => {
    console.log("⏰ [CRON] Iniciando revisión automática de todos los productos...");
    try {
        const productos = await Producto.find({});
        console.log(`🔍 Se encontraron ${productos.length} productos para actualizar.`);
        
        for (const producto of productos) {
            console.log(`🤖 Bot procesando: ${producto.nombre || producto.url}`);
            // Llamamos al motor para cada producto
            await actualizarUnProducto(producto._id).catch(err => 
                console.error(`❌ Error actualizando ${producto._id}:`, err.message)
            );
        }
        console.log("✅ [CRON] Revisión diaria finalizada.");
    } catch (error) {
        console.error("❌ Error en la tarea programada:", error);
    }
});

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan campos" });
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoUsuario = new Usuario({ nombre, email, password: passwordHash, misSeguimientos: [] });
        await nuevoUsuario.save();
        res.json({ message: "Usuario creado" });
    } catch (error) {
        res.status(400).json({ error: "Error al registrar" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });
        if (usuario && (await bcrypt.compare(password, usuario.password))) {
            const token = jwt.sign({ id: usuario._id }, 'MI_FIRMA_SECRETA', { expiresIn: '1d' });
            res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre } });
        } else {
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error en login" });
    }
});

// --- RUTAS DE PRODUCTOS ---

app.post('/api/productos/seguimiento', async (req, res) => {
    try {
        const { url, precioAlerta, userId } = req.body;
        let producto = await Producto.findOne({ url });
        if (!producto) {
            producto = new Producto({ nombre: "Buscando datos...", url, ultimoPrecio: 0 });
            await producto.save();
        }
        await Usuario.findByIdAndUpdate(userId, {
            $addToSet: { misSeguimientos: { producto: producto._id, precioAlerta: precioAlerta } }
        });
        
        // Ejecución inmediata al agregar
        actualizarUnProducto(producto._id).catch(err => console.error("Error en bot:", err));
        
        res.json({ message: "Siguiendo producto" });
    } catch (error) {
        res.status(500).json({ error: "Error al seguir producto" });
    }
});

app.get('/api/usuario/:id/productos', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).populate('misSeguimientos.producto');
        res.json(usuario.misSeguimientos || []);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

app.delete('/api/usuario/:userId/producto/:productoId', async (req, res) => {
    try {
        const { userId, productoId } = req.params;
        console.log(`🗑️ Eliminando producto ${productoId} del usuario ${userId}`);
        
        await Usuario.findByIdAndUpdate(userId, {
            $pull: { misSeguimientos: { producto: productoId } }
        });
        
        res.json({ message: "Eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error en DELETE:", error);
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

// --- STATUS ---
app.get('/api/status', (req, res) => {
    res.json({ status: "En línea", mensaje: "API funcionando" });
});

// Reemplaza el final de tu server.js con esto:
const PORT = process.env.PORT || 5000; // 👈 Prioriza el puerto del servidor si existe
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));