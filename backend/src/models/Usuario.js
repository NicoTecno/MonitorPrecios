const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telegramId: { type: String, default: null }, // 👈 Asegurate de que esta línea esté
    misSeguimientos: [
        {
            producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
            precioAlerta: Number
        }
    ]
});

module.exports = mongoose.model('Usuario', usuarioSchema);