const mongoose = require("mongoose");
const express  = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const User     = require("./public/user");
const app      = express();
const Votacion = require("./public/votacion");
const exphbs   = require("express-handlebars");

const usuariodb = "DarellGutierrez";
const contraseñadb = "12345";
const nombredb = "PaginaWeb";
const uridb = `mongodb+srv://${usuariodb}:${contraseñadb}@DesarrolloWeb.3o4hhff.mongodb.net/${nombredb}?retryWrites=true&w=majority`;
mongoose.connect(uridb) //borré useNewUrlParser y useUnifiedTopology ya que no se usan en las nuevas versiones de node
.then(() => console.log("base de datos conectada")) 
.catch(e => console.log(e))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'mi-secreto', // Deberías cambiar esto a un valor más seguro en un entorno de producción
    resave: false,
    saveUninitialized: false
}));

app.engine('handlebars', exphbs.engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');

app.get('/votaciones', async (req, res) => {
    const votaciones = await Votacion.find({});
    res.render('votaciones', { votaciones });
});

//api /eventos
app.get('/eventos', async (req, res) => {
    const votaciones = await Votacion.find({});
    res.render('votaciones', { votaciones });
    res.send(votaciones);
});
app.get('/votaciones/:id', async (req, res) => {
    const votacion = await Votacion.findById(req.params.id);
    res.render('detalleVotacion', { votacion });
    
});
//api /eventos/:id
app.get('/eventos/:id', async (req, res) => {
    const votacion = await Votacion.findById(req.params.id);
    res.render('detalleVotacion', { votacion });
    res.send(votacion);
});

app.get('/votar', async (req, res) => {
    const votaciones = await Votacion.find({});
    res.render('votar', { votaciones });
});

app.get('/votar/:id', async (req, res) => {
    const votacion = await Votacion.findById(req.params.id);
    res.render('confirmarVoto', { votacion });
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.post("/votacionCreada", async(req, res) =>{
    const {titulo, candidatoUno, candidatoDos, candidatoTres, fechaCierre} = req.body;
    const votacion = new Votacion({
        titulo,
        candidatoUno: {
            nombre: candidatoUno,
            votos: 0
        },
        candidatoDos: {
            nombre: candidatoDos,
            votos: 0
        },
        candidatoTres: {
            nombre: candidatoTres,
            votos: 0
        },
        fechaCierre
    });
    try {
        await votacion.save();
        res.status(200).send("VOTACION CREADA");
    }  catch (err) {
        res.status(500).send(`ERROR AL CREAR LA VOTACION: ${err.message}`);
    }
});

app.post("/registrar", async (req, res) => {
    const {nombre, correo, contrasenha} = req.body; 
    const user = new User({nombre, correo, contrasenha});

    try {
        await user.save();
        res.status(200).send("USUARIO REGISTRADO");
    } catch (err) {
        res.status(500).send(`ERROR AL REGISTRAR AL USUARIO: ${err.message}`);
    }
});

app.post("/ingresar", async (req, res) => {
    const {nombre, correo, contrasenha } = req.body;

    try {
      const user = await User.findOne({correo},{contrasenha},{nombre});
      
      if (!user) {
        res.status(500).send("EL USUARIO NO EXISTE");
      } else {
        user.isCorrectPassword(contrasenha, (err, result) => {
          if (err || !result) {
            res.status(500).send("USUARIO Y/O CONTRASEÑA INCORRECTA");
          } else {
            req.session.nombre = user.nombre;
            req.session.correo = user.correo;
            req.session.contrasenha = user.contrasenha;
            res.status(200).send("USUARIO AUTENTICADO CORRECTAMENTE");
          }
        });
      }
    } catch (err) {
      res.status(500).send("ERROR AL AUTENTICAR AL USUARIO");
    }
  });

//api usuarios/corriente  
app.get("/usuarios/corriente", async (req, res) => {
  if (req.session.nombre) {
    res.send({ nombre: req.session.nombre });
  } else {
    res.send(false);
  }
});

//api usarios/ingresar
app.post("/usuarios/ingresar", async (req, res) => {
    const { correo, contrasenha } = req.body;
  
    try {
      const user = await User.findOne({ correo });
  
      if (!user) {
        res.status(200).send(false); // Usuario no existe
      } else {
        user.isCorrectPassword(contrasenha, (err, result) => {
          if (err || !result) {
            res.status(200).send(false); // Contraseña incorrecta
          } else {
            req.session.correo = user.correo;
            req.session.nombre = user.nombre;
            res.status(200).send(true); // Usuario autenticado correctamente
          }
        });
      }
    } catch (err) {
      res.status(500).send(false); // Error al autenticar al usuario
    }
});

//api eventos/crear
app.post("/eventos/crear", async (req, res) => {
  const { titulo, candidatoUno, candidatoDos, candidatoTres, fechaCierre } = req.body;

  // Verificar si hay un usuario autenticado
  if (!req.session.correo) {
    return res.status(200).send(false); // No hay usuario autenticado
  }

  const votacion = new Votacion({
    titulo,
    candidatoUno: {
      nombre: candidatoUno,
    },
    candidatoDos: {
      nombre: candidatoDos,
    },
    candidatoTres: {
      nombre: candidatoTres,
    },
    fechaCierre,
  });

  try {
    await votacion.save();
    res.status(200).send(true); // Evento creado correctamente
  } catch (err) {
    res.status(500).send(false); // Error al crear el evento
    
  }
});


//api /usuarios/crear
app.post("/usuarios/crear", async (req, res) => {
  const {nombre, correo, contrasenha} = req.body; 
  const user = new User({nombre, correo, contrasenha});

  try {
      await user.save();
      res.status(200).send(true);
  } catch (err) {
      res.status(500).send(false);
  }
});



app.listen(3000, ()=>{
    console.log("servidor iniciado");
});
module.exports = app;