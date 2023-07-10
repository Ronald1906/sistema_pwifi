const { Pool }= require('pg')

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'db_pwifi',
    password: 'ronald123',
    port: 5432 // Puerto por defecto de PostgreSQL
});



module.exports = pool


