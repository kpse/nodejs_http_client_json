'use strict';

module.exports = res => ({
  headers: {
    cookie: res.headers['set-cookie'],
    'Content-Type': 'application/json'
  }
})