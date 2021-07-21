// server.js
const jsonServer = require('json-server');
const app = jsonServer.create();
const minDelay = 30;
const maxDelay = 250;

// Collect metrics
const prometheusExporter = require('@tailorbrands/node-exporter-prometheus');
const options = {
  appName: "devtestbr-api",
  collectDefaultMetrics: true,
  ignoredRoutes: ['/metrics', '/favicon.ico', '/__rules']
};

const promExporter = prometheusExporter(options);
app.use(promExporter.middleware);
app.get('/metrics', promExporter.metrics);

const middlewares = jsonServer.defaults()
app.use(middlewares);

// Add a delay to /devtestbr requests only
app.use('/devtestbr', function (req, res, next) {
  let delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
  setTimeout(next, delay)
});

const router = jsonServer.router('server/db.json');
app.use(router);

const port = 4000;
app.listen(port, () => {
  console.log(
    `JSON server listening on 127.0.0.1:${port}`,
  );
});
