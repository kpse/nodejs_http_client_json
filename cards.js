var _ = require('lodash');
var Q = require('q');
var csv = require('./src/parseCSV');
var file = require('./src/file');

var env = '';

var mapCSV = csv.mapCSV;
var parseCSV = csv.parseCSV;

var SCHOOL_FIELD = '﻿school_id';
var CARD_FIELD = '﻿card';

var promiseOfChildrenCard = mapCSV('ref/children_card.' + env + 'csv');

var promiseOfEmployeeCard = mapCSV('ref/employee_card.' + env + 'csv');

var promiseOfEmptyCard = mapCSV('ref/empty_card.' + env + 'csv');

var promiseOfSchool = parseCSV('ref/school_info.' + env + 'csv', SCHOOL_FIELD);


Q.all([promiseOfChildrenCard, promiseOfEmployeeCard, promiseOfEmptyCard, promiseOfSchool]).then(function (arr) {
  var children = arr[0];
  var employees = arr[1];
  var unused = arr[2];
  var schoolInfo = arr[3];

  console.log(children[0]);
  console.log(employees[0]);
  console.log(unused[0]);
  console.log(schoolInfo);

  var employeesDic = _.groupBy(employees, SCHOOL_FIELD);
  var childrenDic = _.groupBy(children, SCHOOL_FIELD);

  _.each(_.keys(schoolInfo), function (school) {
    outputCards(school, schoolInfo[school.toString()].full_name, employeesDic[school.toString()] || [],
      childrenDic[school.toString()] || []);
  });


  // file.write('空白卡', unusedTransform(unused));
  // console.log('school done: ' + school.school_id);

});

function unusedTransform(info) {
  return {
    "card_info": {
      "card_list": _.map(info, function (card) {
        return {
          "card_no": card[CARD_FIELD],
          "mac_id": card.mac,
          "create_time": "2016-06-12 18:18:18",
          "origin": "youlebao"
        }
      })
    }
  };
}

var outputCards = function (school, name, employees, children) {

  console.log('school cards starting: ' + school);
  var content = {
    "card_info": {
      "school_id": school.toString(),
      "school_name": name,
      "card_list": _.flatten(employeeCards(employees), childrenCards(children))
    }
  };

  file.write(name, content);
  console.log('school cards done: ' + school);
};

function employeeCards(employees) {
  return _.map(employees, function (e) {
    return {
      "card_no": e.card,
      "mac_id": e.mac,
      "status": "0",
      "type": "0",
      "person_id": e.employee_id,
      "person_name": e.name,
      "create_time": "2016-06-12 18:18:18",
      "origin": "youlebao"
    };
  })
}

function childrenCards(children) {
  return _.map(children, function (c) {
    return {
      "card_no": c.card,
      "mac_id": c.mac,
      "status": "0",
      "type": "1",
      "person_id": c.child_id,
      "person_name": c.name,
      "class_id": c.class_id,
      "class_name": c.class_name,
      "create_time": "2016-06-12 18:18:18",
      "origin": "youlebao"
    };
  });
}