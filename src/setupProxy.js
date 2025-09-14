const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/github',
    createProxyMiddleware({
      target: 'https://api.github.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/github': '', // remove /api/github from the path
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add the GitHub token to the request if available
        const token = process.env.REACT_APP_GITHUB_TOKEN?.replace(/['"]/g, '');
        if (token) {
          proxyReq.setHeader('Authorization', `token ${token}`);
        }
        proxyReq.setHeader('User-Agent', 'GitHub-Profile-Explorer');
        proxyReq.setHeader('Accept', 'application/vnd.github.v3+json');
      },
    })
  );
};