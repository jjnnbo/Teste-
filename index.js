const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;
const TARGET = 'https://pocketoption.com';

const MAGO_UI = `
<div style="position:fixed; top:0; left:0; width:100%; height:55px; background:#000; color:#00f7ff; z-index:9999999; display:flex; align-items:center; justify-content:center; border-bottom:2px solid #00f7ff; font-family:sans-serif; box-shadow:0 0 15px #00f7ff;">
    <b style="font-size:18px; letter-spacing:1px;">🧙 MAGO TRADER PRO</b>
</div>
<style>
    body { margin-top: 55px !important; }
    .platform-container { height: calc(100vh - 55px) !important; }
</style>
`;

const proxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    ws: true,
    followRedirects: true,
    autoRewrite: true,
    cookieDomainRewrite: "",
    onProxyReq: (pReq) => {
        pReq.setHeader('Origin', TARGET);
        pReq.setHeader('Referer', TARGET);
        pReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    },
    onProxyRes: (pRes, req, res) => {
        delete pRes.headers['x-frame-options'];
        delete pRes.headers['content-security-policy'];
        
        if (pRes.headers['content-type'] && pRes.headers['content-type'].includes('text/html')) {
            let body = Buffer.from([]);
            pRes.on('data', chunk => body = Buffer.concat([body, chunk]));
            pRes.on('end', () => {
                let html = body.toString().replace(/<body[^>]*>/i, m => m + MAGO_UI);
                res.end(html);
            });
        }
    }
});

app.use('/', proxy);
const server = app.listen(PORT, '0.0.0.0');
server.on('upgrade', proxy.upgrade);
