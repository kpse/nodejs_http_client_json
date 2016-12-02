'use strict';

const _ = require('lodash');

module.exports = (allClasses, subordinate, employee) => {
  // console.log('allClasses', allClasses);
  // console.log('subordinate', subordinate);
  const ret = _.filter(subordinate, c => _.some(allClasses, target => c.toString() == target));

  if(ret.length != subordinate.length) {
    console.log('employees subordinates filtered? ', allClasses, _.compact(subordinate), ret, employee);
  }

  return ret;
}