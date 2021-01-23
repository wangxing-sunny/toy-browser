const Request = require('./Request');

// 使用void实现 IIFE
void async function() {
  let request = new Request({
    method: 'GET',
    host: 'localhost',
    port: 3000,
    path: '/',
    headers: {
      ["X-Foo2"]: "customed"
    },
  });
  const res = await request.send();
  console.log(res);
}();
