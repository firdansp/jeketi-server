require('dotenv').config()

const development = {
    "username": 'naskapal',
    "password": null,
    "database": 'jeketi-server',
    "host": '127.0.0.1',
    "dialect": "postgres",
    "logging": console.log,
    "timezone": '+07:00'
}

const test = {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "timezone": '+07:00'
}
const production = {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_IP,
    "dialect": "postgres",
    "timezone": '+07:00'
}


module.exports = {
    development,
    test,
    production
}