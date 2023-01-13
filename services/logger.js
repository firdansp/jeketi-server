require('dotenv').config();
const pino = require('pino');
const pinoElastic = require('pino-elasticsearch');

const streamToElastic = pinoElastic({
  index: process.env.SERVICE_NAME,
  type: 'log',
  node: `${process.env.ELASTICSEARCH_HOST}:9200`,
  'es-version': 6,
  'bulk-size': 200,
  ecs: true
});

const logger = pino({}, streamToElastic)

module.exports = logger;