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
  headers: { "Content-Type": "application/json" }
};

var host = "https://stage2.cocobabys.com";
var loginUrl = host + "/employee_login.do";
var allSchools = host + "/kindergarten";

var schoolUrl = function(id) {
  return host + "/kindergarten/" + id;
};

client.post(loginUrl, args, function (data, response) {
  // parsed response body as js object
  console.log(data);
  // raw response
  console.log(response);
  writeToFile('school', data);
  client.get(allSchools, {}, function (data) {
    _.each(data, function (s) {
      console.log(s.schoolId);
      writeToFile(s.schoolId, s);
    })
  })
});


function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    console.error('err', err);
  });
}
