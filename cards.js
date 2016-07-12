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


  file.write('空白卡', unusedTransform(unused));
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