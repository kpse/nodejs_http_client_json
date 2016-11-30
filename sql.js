'use strict';

const sqlRange = require('./target_schools').idRangesInSql
const t = require('./template')

console.log('employee_card\n============================\n', t.employeeCard(sqlRange()));
console.log('children_card\n============================\n', t.childrenCard(sqlRange()));
console.log('e_class\n============================\n', t.eClass(sqlRange()));
console.log('p_session\n============================\n', t.pSession(sqlRange()));
console.log('e_session\n============================\n', t.eSession(sqlRange()));
console.log('e_pass\n============================\n', t.ePass(sqlRange()));
console.log('p_pass\n============================\n', t.pPass(sqlRange()));
console.log('school_info\n============================\n', t.schoolInfo(sqlRange()));
console.log('news\n============================\n', t.news(sqlRange()));
