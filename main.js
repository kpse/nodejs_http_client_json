var jsonfile = require('jsonfile');
var _ = require('lodash');


console.log(process.env.username);
console.log(process.env.password);


var credential = {
  account_name: process.env.username,
  password: process.env.password
};

var Client = require('node-rest-client').Client;

var client = new Client();

var args = {
  data: credential,
  headers: {"Content-Type": "application/json"}
};

var host = "https://stage2.cocobabys.com";
var loginUrl = host + "/employee_login.do";
var allSchools = host + "/kindergarten";

var schoolUrl = function (id) {
  return host + "/kindergarten/" + id;
};

client.post(loginUrl, args, function (data, response) {

  client.get(allSchools, transferCookie(response), function (data2, response) {
    console.log(data2);
    _.each(data2, function (s) {
      console.log(s.school_id);
      writeToFile(s.school_id, s);
    })
  })
});

function transferCookie(res) {
  return {headers: {cookie: res.headers['set-cookie'], "Content-Type": "application/json"}}
}

function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    console.error('err', err);
  });
}
