const { Client } = require('pg');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'say_it_db',
    password: 'elja',
    port: 5432,
};
const client = new Client(dbConfig);
module.exports = {dbConfig,client}
