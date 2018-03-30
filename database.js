const pg = require('pg-promise')();
const dbConfig = 'postgres://james@localhost:5432/phoneApp';
const db = pg(dbConfig);


module.exports = db;


