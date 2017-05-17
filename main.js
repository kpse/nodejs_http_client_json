'use strict';

const _ = require('lodash');
const Q = require('q');
const parseCSV = require('./src/parseCSV').parseCSV;
const accumulateCSV = require('./src/parseCSV').accumulateCSV;
const address = require('./src/address');
const transform = require('./src/transform');
const display = require('./src/display');
const file = require('./src/file');
const filterNonExistingClass = require('./src/classesFunctions');
const constants = require('./src/constants');
const takeTargetSchoolOnly = require('./target_schools').filterSchool;
const transferCookie = require('./src/transfer_cookie');
console.log(process.env.username);
console.log(process.env.password);

const env = constants.env;

const credential = {
  account_name: process.env.username || 'username',
  password: process.env.password || 'password'
};

const Client = require('node-rest-client').Client;

const client = new Client();

const args = {
  data: credential,
  headers: {"Content-Type": "application/json"}
};

client.post(constants.loginUrl, args, (data, response) => {

  const cookies = transferCookie(response);
  client.get(constants.allSchools, cookies, all => {
    const schools = all;
    console.log('schools.length = ', schools.length, _.map(schools, 'school_id'));
    const filtered = takeTargetSchoolOnly(schools);
    console.log('filtered', filtered);
    iterateSchools(10, filtered, cookies, outputSchool);
  })
});

//core functions

function iterateSchools(piece, schools, cookies, processFn) {
  if (schools.length === 0) {
    console.log('all done');
    return;
  }
  const tasks = _.map(_.take(schools, piece), s => {
    console.log('s.school_id =', s.school_id);
    return processFn(s, cookies);
  });

  Q.allSettled(tasks).then(results => {
    const next = _.drop(schools, piece);
    const one = _.first(next) || {};
    console.log('next to ', one.full_name, one.school_id);
    iterateSchools(piece, next, cookies, processFn);
  })
    .catch(err => console.log('iterate err', err))
    .done(err => console.log('finished one iteration..'));
}

const outputSchool = (school, cookie) => {
  const writeTask = Q.defer();

  if (file.isExisting(school.full_name)) {
    console.log('skipping, school is existing: ' + school.school_id);
    writeTask.resolve();
    return writeTask.promise;
  }

  console.log('school starting: ' + school.school_id);
  const s = school;
  // console.log("school: ", s);
  const content = {
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
      "create_time": display.digitalTime(s.created_at)
    }
  };

  const employeesDefer = Q.defer();
  client.get(constants.employeeUrl(school), cookie, employeesDefer.resolve);
  const promiseOfEmployees = employeesDefer.promise;

  const relationshipsDefer = Q.defer();
  client.get(constants.relationshipUrl(school), cookie, relationshipsDefer.resolve);
  const promiseOfRelationships = relationshipsDefer.promise;

  const classDefer = Q.defer();
  client.get(constants.classUrl(school), cookie, classDefer.resolve);
  const promiseOfClasses = classDefer.promise;


  const promiseOfParentPass = parseCSV('ref/p_pass.' + env + 'csv', 'phone');

  const promiseOfEmployeePass = parseCSV('ref/e_pass.' + env + 'csv', 'phone');

  const promiseOfEmployeeClass = accumulateCSV('ref/e_class.' + env + 'csv', 'employee_id');

  Q.all([promiseOfEmployees, promiseOfRelationships,
    promiseOfClasses, promiseOfParentPass, promiseOfEmployeePass, promiseOfEmployeeClass]).then(arr => {
    const employees = fillDefault(arr[0], defaultEmployee(school));
    const relationships = arr[1];
    const classes = arr[2];
    const pPass = arr[3];
    const ePass = arr[4];
    const eClass = arr[5];
    // console.log(pPass);
    // console.log(ePass);
    //  console.log(eClass);
    const allClassIds = _.map(classes, cls => cls.class_id);

    const relationshipsWithPassword = _.map(relationships, function (r) {
      // console.log(r.parent.phone, pPass[r.parent.phone]);
      const content = pPass[r.parent.phone] || {password: ''};
      r.password = content.password;
      if (!_.some(allClassIds, i => r.child.class_id === i)) {
        console.log('class is not existing!', r, r.child.class_id, allClassIds);
      }
      return r;
    });
    const employeesWithPassword = _.map(employees, e => {
      const guard = ePass[e.phone] || {login_password: ''};
      const guardSubordinate = eClass[e.id] || [{subordinate: ''}];
      // console.log(guard);
      // console.log(guard.subordinate);
      e.password = guard.login_password || '1bbd886460827015e5d605ed44252251';
      e.subordinate = filterNonExistingClass(allClassIds, _.uniq(_.map(guardSubordinate, 'subordinate')), e);
      // console.log('e.subordinate + ', e.id, e.subordinate);
      return e;
    });

    content['school_info']['master_info'] = transform.pickUpPrincipal(employeesWithPassword);
    content['school_info']['teacher_list'] = transform.employees(employeesWithPassword);
    content['school_info']['class_list'] = transform.classes(classes);
    content['school_info']['parent_list'] = transform.parents(relationshipsWithPassword);
    content['school_info']['child_list'] = transform.children(relationshipsWithPassword);
    // console.log('content', content);

    file.write(school.full_name, content);
    console.log('school done: ' + school.school_id);
    writeTask.resolve();
  }).catch(err => console.log(`school ${school.school_id} retrieve err`, err));
  return writeTask.promise;
};

const fillDefault = (list, defaultOne) => list.length > 1 ? list : _.concat(list, [defaultOne]);

const defaultEmployee = school => ({
  id: `3_${school.school_id}_0002`,
  phone: `1601111${school.school_id}`,
  name: '虚拟老师',
  password: '1bbd886460827015e5d605ed44252251',
  birthday: '1980-01-01',
  gender: '0',
  portrait: '',
  subordinate: []
});
