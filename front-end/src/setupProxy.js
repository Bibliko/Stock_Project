const { createProxyMiddleware } = require('http-proxy-middleware');
const { PORT } = process.env;
const port = PORT || 4000;
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
        target: `http://localhost:${port}`,
        changeOrigin: true,
        //pathRewrite: { [`^/api/`]: '/' },
    })
  );
};