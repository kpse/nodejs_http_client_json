'use strict';

const env = '';

const host = `https://${env}cocobabys.com`;
const loginUrl = `${host}/employee_login.do`;
const allSchools = `${host}/kindergarten`;
const classUrl = school => `${host}/kindergarten/${school.school_id}/class`;
const employeeUrl = school => `${host}/kindergarten/${school.school_id}/employee?most=5000`;
const relationshipUrl = school => `${host}/kindergarten/${school.school_id}/relationship`;

module.exports = {
  classUrl,
  employeeUrl,
  relationshipUrl,
  loginUrl,
  allSchools,
  env
};