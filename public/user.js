const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    correo: {type: String, required: true, unique: true},
    contrasenha: {type: String, required: true}
});

//cuando nos logeemos vamos a comparar el password ingresado con el que tiene la bd:
UserSchema.methods.isCorrectPassword = function(contrasenha, callback){
    if(this.contrasenha === contrasenha){
        callback(null, true);
    }else{
        callback(null, false);
    }
}

module.exports = mongoose.model("User", UserSchema);