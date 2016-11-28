'use strict';

exports.transferCookie = (res) => {
    headers: {
        cookie: res.headers['set-cookie'],
        "Content-Type": "application/json"
    }
}