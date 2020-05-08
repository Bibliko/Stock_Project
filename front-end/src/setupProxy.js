const { createProxyMiddleware } = require('http-proxy-middleware');
const { PORT, NODE_ENV } = process.env;

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
        target: `http://localhost:${NODE_ENV === "production" ? (PORT+1) : 4000}`,
        changeOrigin: true,
        pathRewrite: { [`^/api/`]: '/' },
    })
  );
};