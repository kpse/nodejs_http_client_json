var _ = require('lodash');
var Q = require('q');
var parseCSV = require('./src/parseCSV').parseCSV;
var accumulateCSV = require('./src/parseCSV').accumulateCSV;
var address = require('./src/address');
var transform = require('./src/transform');
var display = require('./src/display');
var file = require('./src/file');

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

  if (file.isExisting(school.full_name)) {
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
      "school_linkphone": s.phone,
      "logo_url": s.school_logo_url,
      "create_time": timeFormat(s.created_at)
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

  var promiseOfEmployeeClass = accumulateCSV('ref/e_class.' + env + 'csv', 'employee_id');

  Q.all([promiseOfEmployees, promiseOfRelationships,
    promiseOfClasses, promiseOfParentPass, promiseOfEmployeePass, promiseOfEmployeeClass]).then(function (arr) {
    var employees = arr[0];
    var relationships = arr[1];
    var classes = arr[2];
    var pPass = arr[3];
    var ePass = arr[4];
    var eClass = arr[5];
    // console.log(pPass);
    // console.log(ePass);
    //  console.log(eClass);
    var allClassIds = _.map(classes, function(cls) {
      return cls.class_id;
    });

    var relationshipsWithPassword = _.map(relationships, function (r) {
      // console.log(r.parent.phone, pPass[r.parent.phone]);
      var content = pPass[r.parent.phone] || {password: ''};
      r.password = content.password;
      if(!_.some(allClassIds, function (i) {return r.child.class_id == i;})) {
        console.log('class is not existing!', r, r.child.class_id, allClassIds);
      }
      return r;
    });
    var employeesWithPassword = _.map(employees, function (e) {
      var guard = ePass[e.phone] || {login_password: ''};
      var guardSubordinate = eClass[e.id] || [{subordinate: ''}];
      // console.log(guard);
      // console.log(guard.subordinate);
      e.password = guard.login_password || 'No password!';
      e.subordinate = filterNonExistingClass(allClassIds, _.uniq(_.map(guardSubordinate, 'subordinate')), e);
      // console.log('e.subordinate + ', e.id, e.subordinate);
      return e;
    });

    content['school_info']['master_info'] = pickUpPrincipal(employeesWithPassword);
    content['school_info']['teacher_list'] = transform.employees(employeesWithPassword);
    content['school_info']['class_list'] = transform.classes(classes);
    content['school_info']['parent_list'] = transform.parents(relationshipsWithPassword);
    content['school_info']['child_list'] = transform.children(relationshipsWithPassword);
    // console.log('content', content);

    file.write(school.full_name, content);
    console.log('school done: ' + school.school_id);
    writeTask.resolve();
  }, function (err) {
    console.log('school retrieve err', err);
  });
  return writeTask.promise;
};

var outputHistory = function (school, employeesDic, parentsDic) {

  if (file.isExisting(school.full_name)) {
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

  content['school_info']['dynamic_list_teacher'] = transform.mapToTeachers(employeesDic);
  content['school_info']['dynamic_list_parent'] = transform.mapToParents(parentsDic);


  file.dynamicOutput(school.full_name, content);
  console.log('school dynamic done: ' + school.school_id);
};

//private

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
    "sex": display.gender(principal.gender),
    "introduction": ""
  };
}

function timeFormat(ts) {
  return new Date(ts + 8*3600000).toISOString().replace('T', ' ').replace(/\..+/, '');
}

function filterNonExistingClass(allClasses, subordinate, employee) {
  // console.log('allClasses', allClasses);
  // console.log('subordinate', subordinate);
  var ret = _.filter(subordinate, function(c) {
    return _.some(allClasses, function (target) {
      return c.toString() == target;
    });
  });
  if(ret.length != subordinate.length)
    console.log('employees subordinates filtered? ', allClasses, _.compact(subordinate), ret, employee);
  return ret;
}