var _ = require('lodash');

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

module.exports = filterNonExistingClass;