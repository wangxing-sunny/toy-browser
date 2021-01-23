const net = require('net');
const { ResponseParser } = require('./ResponseParser');

class Request {
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || '/';
    this.body = options.body || {};
    this.headers = options.headers || {};
    //! Content-Type为必要字段，必须有默认值，不同的Content-Type影响body格式
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(thos.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
    }
    this.headers['Content-Length'] = this.bodyText.length
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          connection.write(this.toString());
        })
      }
      connection.on('data', (data) => {
        // console.log('data:', data.toString());
        const responseParser = new ResponseParser();
        responseParser.receive(data.toString());
        resolve(responseParser.response);
        connection.end();
      });
      connection.on('error', (err) => {
        reject(err);
        connection.end();
      });
    });
  }

  toString() {
    const r = `${this.method} ${this.path} HTTP/1.1
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}

${this.bodyText}`;
    // console.log(r);
    return r;
  }
}

module.exports = Request
