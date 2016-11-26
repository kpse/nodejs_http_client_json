'use strict';

const _ = require('lodash');
const Q = require('q');
const csv = require('./src/parseCSV');
const file = require('./src/file');

const takeTargetSchoolOnly = require('./target_schools').filterSchoolId;

const env = '';
// const env = 'stage2.';

const mapCSV = csv.mapCSV;
const parseCSV = csv.parseCSV;

const SCHOOL_FIELD = 'school_id';
const CARD_FIELD = 'card';

const promiseOfChildrenCard = mapCSV('ref/children_card.' + env + 'csv');

const promiseOfEmployeeCard = mapCSV('ref/employee_card.' + env + 'csv');

const promiseOfEmptyCard = mapCSV('ref/empty_card.' + env + 'csv');

const promiseOfSchool = parseCSV('ref/school_info.' + env + 'csv', SCHOOL_FIELD);


Q.all([promiseOfChildrenCard, promiseOfEmployeeCard, promiseOfEmptyCard, promiseOfSchool]).then((arr) => {
  const children = arr[0];
  const employees = arr[1];
  const unused = arr[2];
  const schoolInfo = arr[3];

  // console.log('children', children[0]);
  // console.log('employees', employees[0]);
  // console.log('unused', unused[0]);
  // console.log('schoolInfo', schoolInfo);

  const employeesDic = _.groupBy(employees, SCHOOL_FIELD);
  const childrenDic = _.groupBy(children, SCHOOL_FIELD);

  _.each(takeTargetSchoolOnly(_.keys(schoolInfo)), (school) => {
    outputCards(school, schoolInfo[school.toString()].full_name, employeesDic[school.toString()] || [],
      childrenDic[school.toString()] || []);
  });


  // file.write('device-空白卡', unusedTransform(unused));
  console.log('school done: ' + school.school_id);

});

function unusedTransform(info) {
  return {
    "school_name": "空白卡",
      "card_list": _.map(info, (card) => {
        return {
          "card_no": card[CARD_FIELD],
          "create_time": "2016-06-12 18:18:18"
        }
      })
  };
}

const outputCards = (school, name, employees, children) => {

  console.log('school cards starting: ' + school);
  const content = {
      "source_school_id": school.toString(),
      "school_name": name,
      "card_list": _.flatten([employeeCards(employees), childrenCards(children)])
  };

  file.write('device_' + school + '_' + name, content);
  console.log('school cards done: ' + school);
};

function employeeCards(employees) {
  return _.map(employees, (e) => {
    return {
      "card_no": e.card,
      "status": "0",
      "type": "0",
      "source_person_id": e.employee_id,
      "person_name": e.name,
      "create_time": "2016-06-12 18:18:18"
    };
  })
}

function childrenCards(children) {
  return _.map(children, (c) => {
    return {
      "card_no": c.card,
      "status": "0",
      "type": "1",
      "source_person_id": c.child_id,
      "person_name": c.name,
      "source_class_id": c.class_id,
      "class_name": c.class_name,
      "create_time": "2016-06-12 18:18:18"
    };
  });
}