const mongoose = require("mongoose");
const votacionSchema = new mongoose.Schema({
    titulo : {type: String, required: true},
    candidatoUno: {
        nombre: {type: String, required: true},
        votos: {type: Number, default: 0}
    },
    candidatoDos: {
        nombre: {type: String, required: true},
        votos: {type: Number, default: 0}
    },
    candidatoTres: {
        nombre: {type: String, required: true},
        votos: {type: Number, default: 0}
    },
    fecha: {type: String, default: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })},
    fechaCierre: {type: String, required: true},
});

module.exports = mongoose.model("Votacion", votacionSchema);