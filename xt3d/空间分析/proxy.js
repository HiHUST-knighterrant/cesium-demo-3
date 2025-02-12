/**
 * 代理
 */

var express = require('express');

var {createProxyMiddleware} = require('http-proxy-middleware');

var app = express();

// 解决跨域问题
app.all("*", function (req, res, next) {
  // 设置允许跨域的域名,*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin', '*');
  // 允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type');
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
  if (req.method.toLowerCase() == 'options')
    res.send(200); // 让options 尝试请求快速结束
  else
    next();
})

// 静态服务
app.use(express.static("./"));

app.use('/data', createProxyMiddleware({
  target: "http://211.149.185.229:8080",
  changeOrigin: true
}));




// 省略各种配置  ... ...
app.listen(9000);
