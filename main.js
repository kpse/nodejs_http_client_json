var jsonfile = require('jsonfile');
var _ = require('lodash');
var Q = require('q');


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

var classUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/class';
};

var employeeUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/employee?most=5000';
};

var relationshipUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/relationship';
};

client.post(loginUrl, args, function (data, response) {

  var cookies = transferCookie(response);
  client.get(allSchools, cookies, function (all) {
    var schools = all;
    console.log(schools[0]);
    _.each([schools[1]], function (s) {
      console.log('s.school_id = ', s.school_id);
      outputSchool(s, cookies)
    })
  })
});

function transferCookie(res) {
  return {headers: {cookie: res.headers['set-cookie'], "Content-Type": "application/json"}}
}

function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

function outputSchool(school, cookie) {
  console.log('school starting: ' + school.school_id);
  var s = school;
  var content = {
    "school_info": {
      "source_id": s.school_id.toString(),
      "school_name": s.fullname,
      "school_description": s.desc,
      "province": provinceOf(s.address),
      "city": cityOf(s.address),
      "area": areaOf(s.address),
      "detailed_address": s.address,
      "school_linkphone": s.phone
    }
  };
  console.log(content);

  var employeesDefer = Q.defer();
  client.get(employeeUrl(school), cookie, function (all) {
    employeesDefer.resolve(all);
  });
  var promiseOfEmployees = employeesDefer.promise;

  var relationshipsDefer = Q.defer();
  client.get(relationshipUrl(school), cookie, function (all) {
    relationshipsDefer.resolve(all);
  });
  var promiseOfRelationships = relationshipsDefer.promise;

  var classDefer = Q.defer();
  client.get(classUrl(school), cookie, function (all) {
    classDefer.resolve(all);
  });
  var promiseOfClasses = classDefer.promise;

  Q.all([promiseOfEmployees, promiseOfRelationships, promiseOfClasses]).then(function(arr) {
    var employees = arr[0];
    var relationships = arr[1];
    var classes = arr[2];
    console.log("employees: ", employees);
    console.log("relationships: ", relationships);
    content['master_info'] = employees[0];
    content['teacher_list'] = employees;
    content['class_list'] = classes;
    content['parent_list'] = relationships;
    content['child_list'] = relationships;
    writeToFile(school.full_name, content);
    console.log('school done: ' + school.school_id);
  });
}

function provinceOf(address) {
  return address;
}
function cityOf(address) {
  return address;
}
function areaOf(address) {
  return address;
}
