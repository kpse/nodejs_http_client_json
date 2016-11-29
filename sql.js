'use strict';

const sqlRange = require('./target_schools').idRangesInSql
const t = require('./template')

console.log('employee_card\n============================\n', t.employeeCard(sqlRange()));
console.log('children_card\n============================\n', t.childrenCard(sqlRange()));
