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
    _.each([schools[1]], function (s) {
      console.log('s.school_id =', s.school_id);
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

  Q.all([promiseOfEmployees, promiseOfRelationships, promiseOfClasses]).then(function (arr) {
    var employees = arr[0];
    var relationships = arr[1];
    var classes = arr[2];

    content['master_info'] = pickUpPrincipal(employees);
    content['teacher_list'] = transformEmployees(employees);
    content['class_list'] = transformClass(classes);
    content['parent_list'] = transformParents(relationships);
    content['child_list'] = transformChildren(relationships);
    // console.log('content', content);

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

function transformClass(classes) {
  return _.map(classes, function (c) {
    return {
      "source_class_id": c.class_id.toString(),
      "class_name": c.name,
      "is_graduation": "0"
    };
  });
}

function transformParents(relationships) {
  // console.log('transformParents', relationships);
  return _.map(relationships, function (r) {
    return {
      "source_parent_id": r.parent.parent_id,
      "mobile": r.parent.phone,
      "name": r.parent.name,
      "password": pickUpParentPassword(r.parent.phone),
      "source_child_id": r.child.child_id,
      "relation_type": ""//与孩子的关系，4-爸爸,5-妈妈,6-爷爷,7-姥姥,8-亲属,10-姥爷,11-奶奶
    };
  })
}
function transformChildren(relationships) {
  // console.log('transformChildren');
  return _.map(relationships, function (r) {
    return {
      "source_child_id": r.child.child_id,
      "name": r.child.name,
      "source_class_id": r.child.class_id.toString(),
      "birthday": r.child.birthday + " 00:00:00",
      "sex": genderDisplay(r.child.gender), //0-未知，1-男，2-女
      "is_graduation": "0", //0-否，1-是
      "is_in_school": "1" //0-否，1-是
    };
  })
}

function transformEmployees(employees) {
  // console.log('transformEmployees', employees);
  return _.map(employees, function (e) {
    return {
      "source_teacher_id": e.id,
      "mobile": e.phone,
      "name": e.name,
      "password": pickUpEmployeePassword(e.phone),
      "birthday": e.birthday + " 00:00:00",
      "sex": genderDisplay(e.gender), //0-未知，1-男，2-女
      "source_class_id": "??"
    };
  });
}

function pickUpPrincipal(employees) {
  // console.log('pickUpPrincipal', employees);
  var principal = _.find(employees, function (e) {
    return e.privilege_group == 'principal';
  });
  return principal == undefined ? {} : {
    "source_master_id": principal.id,
    "mobile": principal.phone,
    "name": principal.name,
    "password": pickUpEmployeePassword(principal.phone),
    "introduction": ""
  };
}

function genderDisplay(gender) {
  return gender == 0 ? '1' : '2';
}

function pickUpParentPassword(phone) {
  return phone;
}

function pickUpEmployeePassword(phone) {
  return phone;
}