const { createProxyMiddleware } = require('http-proxy-middleware');
const { PORT, NODE_ENVIRONMENT } = process.env;

module.exports = function(app) {
  console.log(process.env);
  app.use(
    '/api',
    createProxyMiddleware({
        target: `http://localhost:${NODE_ENVIRONMENT === "production" ? (parseInt(PORT,10)+1) : 4000}`,
        changeOrigin: true,
        pathRewrite: { [`^/api/`]: '/' },
    })
  );
};