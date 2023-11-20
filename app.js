const Hapi = require('@hapi/hapi');
const { client } = require('./connection/db');

const routes = require('./routes/api');

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
});

client.connect();

// Route untuk registrasi
server.route(routes);

const init = async () => {
  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};

process.on('SIGINT', async () => {
  await client.end();
  process.exit(0);
});

init();
