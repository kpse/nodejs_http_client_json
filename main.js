var jsonfile = require('jsonfile');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var parseCSV = require('./src/parseCSV');
var address = require('./src/address');
var transform = require('./src/transform');
var display = require('./src/display');

console.log(process.env.username);
console.log(process.env.password);
// var env = '';
var env = 'stage2.';

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
    iterateSchools(5, schools, cookies, outputSchool);
    // iterateSchools2(schools);
  })
});

//core functions

function iterateSchools(piece, schools, cookies, processFn) {
  if (schools.length == 0) {
    return console.log('all done');
  }
  var tasks = _.map(_.take(schools, piece), function (s) {
    console.log('s.school_id =', s.school_id);
    return processFn(s, cookies);
  });

  Q.allSettled(tasks).then(function (results) {
    var next = _.drop(schools, piece);
    var one = _.first(next) || {};
    console.log('next to ', one.full_name, one.school_id);
    iterateSchools(piece, next, cookies, processFn);
  }, function (err) {
    console.log('iterate err', err);
  }).done(function (err) {
    console.log('finished one iteration..');
  });
}

function iterateSchools2(schools) {

  var promiseOfParentSession = parseCSV('ref/p_session.' + env + 'csv', 'sender');

  var promiseOfEmployeeSession = parseCSV('ref/e_session.' + env + 'csv', 'sender');

  Q.all([promiseOfParentSession, promiseOfEmployeeSession]).then(function (arr) {
    var parents = arr[0];
    var employees = arr[1];
    // console.log(employees);
    // console.log(parents);

    var employeesDic = _.groupBy(employees, 'school_id');
    var parentsDic = _.groupBy(parents, 'school_id');

    // console.log(employeesDic);
    // console.log(parentsDic);

    _.each(schools, function (school) {
      outputHistory(school, employeesDic[school.school_id.toString()] || [],
        parentsDic[school.school_id.toString()] || []);
    });

  }, function (err) {
    console.log('school dynamic retrieve err', err);
  });

}


var outputSchool = function (school, cookie) {
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
      "province": address.provinceOf(s.address),
      "city": address.cityOf(s.address),
      "area": address.areaOf(s.address),
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


  var promiseOfParentPass = parseCSV('ref/p_pass.' + env + 'csv', 'phone');

  var promiseOfEmployeePass = parseCSV('ref/e_pass.' + env + 'csv', 'phone');


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
    content['school_info']['teacher_list'] = transform.employees(employeesWithPassword);
    content['school_info']['class_list'] = transform.classes(classes);
    content['school_info']['parent_list'] = transform.parents(relationshipsWithPassword);
    content['school_info']['child_list'] = transform.children(relationshipsWithPassword);
    // console.log('content', content);

    writeToFile(school.full_name, content);
    console.log('school done: ' + school.school_id);
    writeTask.resolve();
  }, function (err) {
    console.log('school retrieve err', err);
  });
  return writeTask.promise;
};

var outputHistory = function (school, employeesDic, parentsDic) {

  if (isFileExisting(school.full_name)) {
    console.log('skipping, school is existing: ' + school.school_id);
  }

  console.log('school starting history: ' + school.school_id);
  var s = school;
  var content = {
    "school_info": {
      "source_id": s.school_id.toString(),
      "school_name": s.full_name,
      "dynamic_list_teacher": [],
      "dynamic_list_parent": []
    }
  };

  content['school_info']['dynamic_list_teacher'] = mappingTeacherSessions(employeesDic);
  content['school_info']['dynamic_list_parent'] = mappingParentSessions(parentsDic);


  dynamicInfoOutput(school.full_name, content);
  console.log('school dynamic done: ' + school.school_id);
};

//private



var mappingTeacherSessions = function (sessions) {
  return _.map(sessions, function (s) {
    var item = {
      "source_teacher_id": s.sender,
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "is_public": "0",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type == 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }

    return item;
  });
}

var mappingParentSessions = function (sessions) {
  return _.map(sessions, function (s) {
    var item = {
      "source_parent_id": s.sender,
      "source_child_id": retrieveChildId(s.session_id),
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "is_public": "0",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type == 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }

    return item;
  });
}

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

// output
function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

function dynamicInfoOutput(filename, obj) {
  var file = './out-dynamic/dynamic-' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
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

function retrieveChildId(sessionId) {
  return sessionId.substring(2);
}