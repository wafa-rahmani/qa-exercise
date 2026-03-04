const { createProxyDownstreamServer } = require('./downstreamServer');

const server = createProxyDownstreamServer();

server.listen(8085, '127.0.0.1', () => {
  console.log('Downstream server is running on http://127.0.0.1:8085');
});
