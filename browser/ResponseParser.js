const { TrunkedBodyParser } = require('./TrunkedBodyParser');
const WAITING_STATUS_LINE = 0;
const WAITING_STATUS_LINE_END = 1;
const WAITING_HEADER_NAME = 2;
const WAITING_HEADER_SPACE = 3;
const WAITING_HEADER_VALUE = 4;
const WAITING_HEADER_LINE_END = 5;
const WAITING_HEADER_BLOCK_END = 6;
const WAITING_BODY = 7;

class ResponseParser {
  constructor() {
    this.currentState = WAITING_STATUS_LINE;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
    this.bodyParser = null;
  }

  get finished() {
    return this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('-'),
    };
  }

  receive(string) {
    for(let c of string) {
      this.receiveChar(c);
    }
  }

  // 状态函数
  receiveChar(char) {
    // console.log(char === '\r' ? '\\r' : char === '\n' ? '\\n' : char);
    if (this.currentState === WAITING_STATUS_LINE) {
      if (char === '\r') {
        this.currentState = WAITING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.currentState === WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.currentState = WAITING_HEADER_NAME;
      }
    } else if (this.currentState === WAITING_HEADER_NAME) {
      if (char === ':') {
        this.currentState = WAITING_HEADER_SPACE;
      } else if (char === '\r') {
        this.currentState = WAITING_HEADER_BLOCK_END;
        this.bodyParser = new TrunkedBodyParser();
      } else {
        this.headerName += char;
      }
    } else if (this.currentState === WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.currentState = WAITING_HEADER_VALUE;
      }
    } else if (this.currentState === WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.currentState = WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = '';
        this.headerValue = '';
      } else {
        this.headerValue += char;
      }
    } else if (this.currentState === WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.currentState = WAITING_HEADER_NAME;
      }
    } else if (this.currentState === WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.currentState = WAITING_BODY;
      }
    } else if (this.currentState === WAITING_BODY) {
      this.bodyParser.receiveChar(char);
    }
  }
}

module.exports = { ResponseParser };
