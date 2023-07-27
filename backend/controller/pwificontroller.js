const express = require('express');
const router = express.Router();
const conexion = require('../database/database');
const ping = require('ping');
const nodemailer = require('nodemailer');
//Configuración del email
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'rpencarnacionr@gmail.com',
      pass: 'hqajssxighigthnj'
    }
});

//Función para enviar el correo
const enviarCorreo = async (mailOptions) => {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado: ' + info.response);
    } catch (error) {
      console.log('Error en NodeMailer al enviar el email: ' + error);
      // Vuelve a intentar enviar el correo
      await enviarCorreo(mailOptions);
    }
};

//Funcion para tener un control de los estados de los puntos wifi 
//en pseudo tiempo real
const consultaAutomatica = async()=>{
    try {
        // Consulta para obtener los puntos wifi
        const consulta = await conexion.query('SELECT * FROM p_wifi');
        const puntoswifi = consulta.rows;

        let PuntosCaidos=[]

        // Empleamos Promise.all para que ejecute todos los ping antes de hacer el envío de parámetros
        const resultadoPing= await Promise.all(
            puntoswifi.map(async (punto) => {
                // Realizamos el ping al punto wifi
                const pingResult = await ping.promise.probe(punto.ip);

                const estado = JSON.parse(punto.estado);

                //Verificamos el estado en el que se encontraba el ping cuando se obtuvo de la bdd
                //En caso de que se encontrabada el estado en true
                if(estado == true){
                    //Verificamos el resultado del ping obtenido
                    //Si el ping obtenido es false
                    if(pingResult.alive == false){
                        //Se crea un objeto, el cual se agregara a la columna historial de la tabla logs
                        let objeto = {
                            fecha: new Date().toISOString().substring(0, 10),
                            hora: new Date().toLocaleTimeString(),
                            estado: false,
                          };
                        //Se obtiene la tabla logs de ese punto
                        const logpunto= await conexion.query('Select * from logs where id_punto = '+punto.id)
                        
                        //Se obtiene el historial ya que se inicializo en null 
                        let historialActual= logpunto.rows[0].historial
                        //En caso de que este en null
                        if(!historialActual){
                            //Se inicializa la variable como un array vacio
                            historialActual=[]
                        }

                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];
                        
                        PuntosCaidos.push({
                            punto:punto.nombre,
                        })

                        // Actualizamos la tabla puntos_wifi con el nuevo estado obtenido del ping
                        await conexion.query('UPDATE p_wifi SET estado = false WHERE id = ' + punto.id);

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id])
                        
                    }
                    
                //En caso de que se encontraba el estado en false
                }else if(estado == false){
                    //Se crea un objeto, el cual se agregara a la columna historial de la tabla logs
                    let fecha=new Date()
                    //Se obtiene la tabla logs de ese punto
                    const logpunto= await conexion.query('Select * from logs where id_punto = '+punto.id)
                        
                    //Se obtiene el historial ya que se inicializo en null 
                    let historialActual= logpunto.rows[0].historial

                    //En caso de que este en null
                    if(!historialActual){
                        //Se inicializa la variable como un array vacio
                        historialActual=[]
                    }
                    

                    //Si el resultado del ping es true
                    if(pingResult.alive == true){

                        let objeto = {
                            fecha: fecha.toISOString().substring(0, 10),
                            hora: fecha.toLocaleTimeString(),
                            estado: true,
                        };

                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];
                        
                        // Actualizamos la tabla puntos_wifi con el nuevo estado obtenido del ping
                        await conexion.query('UPDATE p_wifi SET estado = true WHERE id = ' + punto.id);

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id]);
                    }else if(pingResult.alive == false){

                        let objeto = {
                            fecha: fecha.toISOString().substring(0, 10),
                            hora: fecha.toLocaleTimeString(),
                            estado: false,
                        };

                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];

                        PuntosCaidos.push({
                            punto:punto.nombre,
                        })

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id]);
                    }
                }
            })

        )

        //Verificación de los puntos wifi para enviar el correo
        /*if(PuntosCaidos.length>0){

            //Opciones del email
            const mailOptions = {
                from: 'rpencarnacionr@gmail.com',
                to: 'ronalder_10@hotmail.com',
                subject: 'Prueba de Correo',
                text: 'Actualmente se tiene los siguientes puntos wifi inactivos por mas de media hora: '+ JSON.stringify(PuntosCaidos)
            };

            enviarCorreo(mailOptions);

        }*/

        return resultadoPing

    } catch (error) {
        console.log('Error en Funcion Pseudo Tiempo Real: '+ error)
    }
}


// Función para realizar la consulta automática
router.get('/', async(req,res)=>{
    try {
        // Consulta para obtener los puntos wifi
        const consulta = await conexion.query('SELECT * FROM p_wifi');
        const puntoswifi = consulta.rows;
    
        // Empleamos Promise.all para que ejecute todos los ping antes de hacer el envío de parámetros
        const resultadoPing = await Promise.all(
          // Recorremos los datos de la consulta con map
          puntoswifi.map(async (punto) => {
            // Realizamos el ping al punto wifi
            const pingResult = await ping.promise.probe(punto.ip);

            //Extraemos el historial del punto wifi
            const historialp= await conexion.query('SELECT *  FROM logs WHERE id_punto = '+punto.id)

            return {
              ...punto,
              estado: pingResult.alive,
              historial: historialp.rows[0].historial
            };
          })
        );
    
        // Enviar los puntos WiFi con los resultados de ping como respuesta
        res.json(resultadoPing);
    }catch (error) {
        console.log('Error en consult_auto ' + error);
    }
})

//Método para revisar la consultaAutomatica en el insonmia
router.get('/prueba',async(req,res)=>{
    try {
        // Consulta para obtener los puntos wifi
        const consulta = await conexion.query('SELECT * FROM p_wifi');
        const puntoswifi = consulta.rows;

        let PuntosCaidos=[]

        // Empleamos Promise.all para que ejecute todos los ping antes de hacer el envío de parámetros
        const resultadoPing = await Promise.all(
            puntoswifi.map(async (punto) => {
                // Realizamos el ping al punto wifi
                const pingResult = await ping.promise.probe(punto.ip);

                const estado = JSON.parse(punto.estado);

                //Verificamos el estado en el que se encontraba el ping cuando se obtuvo de la bdd
                //En caso de que se encontrabada el estado en true
                if(estado == true){
                    //Verificamos el resultado del ping obtenido
                    //Si el ping obtenido es false
                    if(pingResult.alive == false){
                        //Se crea un objeto, el cual se agregara a la columna historial de la tabla logs
                        let objeto = {
                            fecha: new Date().toISOString().substring(0, 10),
                            hora: new Date().toLocaleTimeString(),
                            estado: false,
                          };
                        //Se obtiene la tabla logs de ese punto
                        const logpunto= await conexion.query('Select * from logs where id_punto = '+punto.id)
                        
                        //Se obtiene el historial ya que se inicializo en null 
                        let historialActual= logpunto.rows[0].historial
                        //En caso de que este en null
                        if(!historialActual){
                            //Se inicializa la variable como un array vacio
                            historialActual=[]
                        }

                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];
                        
                        // Actualizamos la tabla puntos_wifi con el nuevo estado obtenido del ping
                        await conexion.query('UPDATE p_wifi SET estado = false WHERE id = ' + punto.id);

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id])
                        
                    }
                    
                //En caso de que se encontraba el estado en false
                }else if(estado == false){
                    //Se crea un objeto, el cual se agregara a la columna historial de la tabla logs
                    let fecha=new Date()
                    let objeto = {
                        fecha: fecha.toISOString().substring(0, 10),
                        hora: fecha.toLocaleTimeString(),
                        estado: false,
                    };
                    //Se obtiene la tabla logs de ese punto
                    const logpunto= await conexion.query('Select * from logs where id_punto = '+punto.id)
                        
                    //Se obtiene el historial ya que se inicializo en null 
                    let historialActual= logpunto.rows[0].historial

                    //En caso de que este en null
                    if(!historialActual){
                        //Se inicializa la variable como un array vacio
                        historialActual=[]
                    }
                    

                    //Si el resultado del ping es true
                    if(pingResult.alive == true){
                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];
                        
                        // Actualizamos la tabla puntos_wifi con el nuevo estado obtenido del ping
                        await conexion.query('UPDATE p_wifi SET estado = true WHERE id = ' + punto.id);

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id]);
                    }else if(pingResult.alive == false){
                        //Se crea una variable nueva con el sprint separator para agregar el nuevo objeto
                        const nuevoHistorial = [...historialActual, objeto];

                        PuntosCaidos=[{
                            punto:punto.nombre,
                        }]

                        //Se actualiza el historial
                        await conexion.query('UPDATE logs SET historial = $1 WHERE id_punto = $2', [nuevoHistorial, punto.id]);
                    }
                }

                //Se retorna el punto junto con su estado
                return {
                    ...punto,
                    estado: pingResult.alive,
                };

            })

        )

        if(PuntosCaidos.length>0){

            //Opciones del email
            const mailOptions = {
                from: 'rpencarnacionr@gmail.com',
                to: 'ronalder_10@hotmail.com',
                subject: 'Prueba de Correo',
                text: 'Actualmente se tiene los siguientes puntos wifi inactivos por mas de media hora: '+ JSON.stringify(PuntosCaidos)
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log('Error en NodeMailer al enviar el email: '+error);
                } /*else {
                  console.log('Correo enviado: ' + info.response);
                }*/
            });
        }

        //Se envia el resultado de los ping
        res.send(resultadoPing)
        
    } catch (error) {
        console.log('Error en prueba: '+ error)
    }
})

router.get('/logs', async (req, res) => {
  try {
    const consulta = await conexion.query('SELECT * FROM logs');
    res.send(consulta.rows);
  } catch (error) {
    console.log('Error en pwificontroller en el metodo get /logs: ' + error);
    res.status(500).json({ error: 'Error al obtener los logs' });
  }
});

router.get('/nuevo', async(req,res)=>{
    try {
        res.json(new Date().toISOString().substring(0,10)+' - '+ new Date().toLocaleTimeString())
    } catch (error) {
        console.log('Error')
    }
})

module.exports = { router, consultaAutomatica };
