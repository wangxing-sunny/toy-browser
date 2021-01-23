const http = require('http');

const app = http.createServer((req, res) => {
  let body = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log(body);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('success');
  })
})

app.listen(3000, 'localhost', () => {
  console.log('started')
});
