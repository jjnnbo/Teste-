const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
// O Render exige que usemos process.env.PORT
const PORT = process.env.PORT || 10000;

// Rota de teste simples para o Render detectar que o site está vivo
app.get('/healthcheck', (req, res) => {
    res.status(200).send('Mago is Alive');
});

const proxy = createProxyMiddleware({
    target: 'https://pocketoption.com',
    changeOrigin: true,
    ws: true,
    followRedirects: true,
    autoRewrite: true,
    onProxyRes: (pRes, req, res) => {
        delete pRes.headers['x-frame-options'];
        delete pRes.headers['content-security-policy'];
        
        if (pRes.headers['content-type'] && pRes.headers['content-type'].includes('text/html')) {
            let body = Buffer.from([]);
            pRes.on('data', d => body = Buffer.concat([body, d]));
            pRes.on('end', () => {
                const header = '<div style="height:55px; background:#000; color:#0ff; display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; z-index:999999; border-bottom:2px solid #0ff; font-family:sans-serif;"><b>🧙 MAGO TRADER PRO</b></div><style>body{margin-top:55px!important;}</style>';
                let html = body.toString().replace(/<body[^>]*>/i, m => m + header);
                res.end(html);
            });
        }
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Erro na conexão com a Corretora.');
    }
});

// Aplica o proxy em todas as outras rotas
app.use('/', proxy);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Mago rodando na porta ${PORT}`);
});

// Suporte para o gráfico (WebSocket)
server.on('upgrade', (req, socket, head) => {
    proxy.upgrade(req, socket, head);
});
