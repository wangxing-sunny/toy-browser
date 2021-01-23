const WAITING_LENGTH = 0;
const WAITING_LENGTH_LINE_END = 1;
const READING_TRUNK = 2;
const WAITING_NEW_LINE = 3;
const WAITING_NEW_LINE_END = 4;
const FINISHED = 5;
class TrunkedBodyParser {
  constructor() {
    this.currentState = WAITING_LENGTH;
    this.content = [];
    this.length = 0;
    this.isFinished = false;
  }

  receiveChar(char) {
    // console.log(char === '\r' ? '\\r' : char === '\n' ? '\\n' : char);
    if (this.currentState === FINISHED) {
      return;
    } else if (this.currentState === WAITING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          this.isFinished = true;
          this.currentState = FINISHED;
        }
        this.currentState = WAITING_LENGTH_LINE_END;
      } else {
        this.length *= 16;
        this.length += parseInt(char, 16);
      }
    } else if (this.currentState === WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.currentState = READING_TRUNK;
      }
    } else if (this.currentState === READING_TRUNK) {
      this.content.push(char);
      this.length--;
      if (this.length === 0) {
        this.currentState = WAITING_NEW_LINE;
      }
    } else if (this.currentState === WAITING_NEW_LINE) {
      if (char === '\r') {
        this.currentState = WAITING_NEW_LINE_END;
      }
    } else if (this.currentState === WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.currentState = WAITING_LENGTH;
      }
    }
  }
}

module.exports = { TrunkedBodyParser };
