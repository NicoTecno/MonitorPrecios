const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: String,
    url: { type: String, unique: true },
    ultimoPrecio: Number,
    historial: [{
        precio: Number,
        fecha: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);