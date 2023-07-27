const express = require('express')
const app = express()
const pool =require('./database/database');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const cors = require('cors')
const cron = require('node-cron');


//Creamos un middleware para la validacion del token
const verifyTokenMiddleware = (req, res, next) => {
    const token = req.headers['token_stodgo'];
    if (token) {
      jwt.verify(token, process.env.CLVSECRET, (err, decoded) => {
        if (err) {
          res.send({ auth: false, message: 'Fallo al autenticar el token' });
        } else {
          let objeto = {
            exp: decoded.exp,
            data: decoded.data
          };
          req.valtoken = objeto;
          next();
        }
      });
    }
};


app.use(express.json())

//Seteando las cookies
app.use(bodyParser.json({limit: "50mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}))

app.use(cors({
    origin:['http://44.218.29.246:1001'], //Direccion de origen de donde provienen las peticiones
    methods: ['GET', 'POST'],
    credentials: true
}))

const pwifiRouter= require('./controller/pwificontroller')
app.use('/puntos_wifi',pwifiRouter.router)



//Verificamos si existe conexion a la base de datos e inicializamos el server
pool.connect((error, client, release) => {
    if (error) {
      console.error('Error al conectar a la base de datos:', error);
      return;
    }else{
      console.log('Conexion exitosa ')
      release()
      //estableciendo el puerto con el que trabajara nodejs
      let puerto=1000
      app.listen(puerto,()=>{
        console.log('Servidor iniciado en el http://44.218.29.246:'+puerto)
          
        // Realizar consulta al iniciar el servidor
        pwifiRouter.consultaAutomatica();

        // Programar ejecución automática cada 2 minutos
        setInterval(() => {
          pwifiRouter.consultaAutomatica();
          //console.log('Se ejecutó cada 15 minutos');
        }, 15 * 60 * 1000);
      })
    }
});