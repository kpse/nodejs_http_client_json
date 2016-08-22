var env = '';
// var env = 'stage2.';


var host = "https://" + env + "cocobabys.com";
var loginUrl = host + "/employee_login.do";
var allSchools = host + "/kindergarten";

var classUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/class';
};

var employeeUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/employee?most=5000';
};

var relationshipUrl = function (school) {
  return host + "/kindergarten/" + school.school_id + '/relationship';
};


module.exports = {
  classUrl: classUrl,
  employeeUrl: employeeUrl,
  relationshipUrl: relationshipUrl,
  loginUrl: loginUrl,
  allSchools: allSchools,
  env: env
}