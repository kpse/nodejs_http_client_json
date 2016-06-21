var jsonfile = require('jsonfile');

var http = require('http');

console.log(process.env.username);
console.log(process.env.password);

var file = './out/data.json'
var obj = {
  username: process.env.username,
  password: process.env.password
}

jsonfile.writeFile(file, obj, function (err) {
  console.error(err)
})