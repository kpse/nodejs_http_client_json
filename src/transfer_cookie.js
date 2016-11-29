'use strict';

module.exports = (res) => {
  return {
    headers: {
      cookie: res.headers['set-cookie'],
      'Content-Type': 'application/json'
    }
  }
}