var jsonfile = require('jsonfile');
var _ = require('lodash');
var Q = require('q');
var csv = require('csv-parser');
var fs = require('fs');


console.log(process.env.username);
console.log(process.env.password);
var env = '';
// var env = 'stage2.';

var credential = {
  account_name: process.env.username || 'username',
  password: process.env.password || 'password'
};

var Client = require('node-rest-client').Client;

var client = new Client();

var args = {
  data: credential,
  headers: {"Content-Type": "application/json"}
};

var host = "https://" + env + "cocobabys.com";
var loginUrl = host + "/employee_login.do";
var allSchools = host + "/kindergarten";


client.post(loginUrl, args, function (data, response) {

  var cookies = transferCookie(response);
  client.get(allSchools, cookies, function (all) {
    var schools = all;
    console.log('schools.length = ', schools.length, _.map(schools, 'school_id'));
    iterateSchools(5, schools, cookies);
  })
});

//core functions

function iterateSchools(piece, schools, cookies) {
  if (schools.length == 0) {
    return console.log('all done');
  }
  var tasks = _.map(_.take(schools, piece), function (s) {
    console.log('s.school_id =', s.school_id);
    return outputSchool(s, cookies);
  });

  Q.allSettled(tasks).then(function (results) {
    var next = _.drop(schools, piece);
    var one = _.first(next) || {};
    console.log('next to ', one.full_name, one.school_id);
    iterateSchools(piece, next, cookies);
  }, function (err) {
    console.log('iterate err', err);
  }).done(function (err) {
    console.log('finished one iteration..');
  });
}


function outputSchool(school, cookie) {
  var writeTask = Q.defer();

  if (isFileExisting(school.full_name)) {
    console.log('skipping, school is existing: ' + school.school_id);
    writeTask.resolve();
    return writeTask.promise;
  }

  console.log('school starting: ' + school.school_id);
  var s = school;
  var content = {
    "school_info": {
      "source_id": s.school_id.toString(),
      "school_name": s.full_name,
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


  var pPassDefer = Q.defer();
  var pPassDic = {};
  fs.createReadStream('ref/p_pass.' + env + 'csv')
    .pipe(csv())
    .on('data', function (data) {
      // console.log(data);
      pPassDic[data['phone']] = data["password"]
    }).on('end', function () {
    pPassDefer.resolve(pPassDic);
  });
  var promiseOfParentPass = pPassDefer.promise;

  var ePassDefer = Q.defer();
  var ePassDic = {};
  fs.createReadStream('ref/e_pass.' + env + 'csv')
    .pipe(csv())
    .on('data', function (data) {
      // console.log(data);
      ePassDic[data['phone']] = data;
    }).on('end', function () {
    ePassDefer.resolve(ePassDic);
  });
  var promiseOfEmployeePass = ePassDefer.promise;


  Q.all([promiseOfEmployees, promiseOfRelationships,
    promiseOfClasses, promiseOfParentPass, promiseOfEmployeePass]).then(function (arr) {
    var employees = arr[0];
    var relationships = arr[1];
    var classes = arr[2];
    var pPass = arr[3];
    var ePass = arr[4];
    // console.log(pPass);
    // console.log(ePass);

    var relationshipsWithPassword = _.map(relationships, function (r) {
      // console.log(r.parent.phone, pPass[r.parent.phone]);
      r.password = pPass[r.parent.phone] || '';
      return r;
    });
    var employeesWithPassword = _.map(employees, function (e) {
      var guard = ePass[e.phone] || {subordinate: '', login_password: ''};
      // console.log(guard);
      // console.log(guard.subordinate);
      e.password = guard.login_password;
      e.subordinate = guard.subordinate || '';
      return e;
    });

    content['school_info']['master_info'] = pickUpPrincipal(employeesWithPassword);
    content['school_info']['teacher_list'] = transformEmployees(employeesWithPassword);
    content['school_info']['class_list'] = transformClass(classes);
    content['school_info']['parent_list'] = transformParents(relationshipsWithPassword);
    content['school_info']['child_list'] = transformChildren(relationshipsWithPassword);
    // console.log('content', content);

    writeToFile(school.full_name, content);
    console.log('school done: ' + school.school_id);
    writeTask.resolve();
  }, function (err) {
    console.log('school retrieve err', err);
  });
  return writeTask.promise;
}

//private

var isFileExisting = function (name) {
  try {
    fs.accessSync('./out/' + name + '.json', fs.F_OK);
    return true;
  } catch (e) {
  }
  return false;
};

var classUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/class';
};

var employeeUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/employee?most=5000';
};

var relationshipUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/relationship';
};


function transferCookie(res) {
  return {headers: {cookie: res.headers['set-cookie'], "Content-Type": "application/json"}}
}

function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

function provinceOf(address) {
  var m;
  if (address == null) {
    return '';
  }
  m = address.match(/^([^市省县区]+?省)/);
  if (m == null) {
    m = address.match(/^([^市省县自治区]+?自治区)/);
  }
  if (m == null) {
    m = address.match(/^([^市省县自治特别行政区]+?特别行政区)/);
  }
  return (m && m[0]) || '';
}
function cityOf(address) {
  var m;
  if (address == null) {
    return '';
  }
  m = address.match(/[^市省县区]+?[省|区]([^市省县区]+?自治州)/);
  if (m == null) {
    m = address.match(/[^市省县区]+?[省|区]([^市省县区]+?市)/);
  }
  if (m == null) {
    m = address.match(/^([^市省县区]+?市)/);
  }
  return (m && m[1]) || '';
}
function areaOf(address) {
  var m;
  if (address == null) {
    return '';
  }
  m = address.match(/自治州(.+?(县|区|市))/);
  if (m == null) {
    m = address.match(/市(.+?(县|区|市))/);
  }
  return (m && m[1]) || '';
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
  return _(relationships).map(function (r) {
    return {
      "source_parent_id": r.parent.parent_id,
      "mobile": r.parent.phone,
      "name": r.parent.name,
      "password": r.password,
      "source_child_id": r.child.child_id,
      "relation_type": relationshipTranslate(r.relationship)
    };
  }).groupBy('source_parent_id').map(function (family) {
    var parent = family[0];
    if (family.length > 1) {
      var children = _.map(family, function (p) {
        return p["source_child_id"];
      });
      var relationships = _.map(family, function (p) {
        return p["relation_type"];
      });
      parent["source_child_id"] = children;
      parent["relation_type"] = relationships;
      console.log('multiple children parent: ', parent);
      return parent;
    }
    parent["source_child_id"] = [parent["source_child_id"]];
    parent["relation_type"] = [parent["relation_type"]];
    return parent;
  }).values();

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
      "password": e.password,
      "birthday": e.birthday + " 00:00:00",
      "sex": genderDisplay(e.gender), //0-未知，1-男，2-女
      "source_class_id": e.subordinate
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
    "password": principal.password,
    "introduction": ""
  };
}

function genderDisplay(gender) {
  return gender == 0 ? '1' : '2';
}

function relationshipTranslate(relationshipName) {
  //与孩子的关系，4-爸爸,5-妈妈,6-爷爷,7-姥姥,8-亲属,10-姥爷,11-奶奶
  if (relationshipName == '爸爸') {
    return '4';
  } else if (relationshipName == '妈妈') {
    return '5';
  } else if (relationshipName == '爷爷') {
    return '6';
  } else if (relationshipName == '姥姥') {
    return '7';
  } else if (relationshipName == '姥爷') {
    return '10';
  } else if (relationshipName == '奶奶') {
    return '11';
  } else return '8';
}
