const http = require('http');

const app = http.createServer((req, res) => {
  res.write('success');
  res.end();
})

app.listen(7788, 'localhost', () => {
  console.log('started')
});