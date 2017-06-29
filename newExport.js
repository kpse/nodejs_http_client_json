'use strict';

const _ = require('lodash');
const Q = require('q');
const accumulateCSV = require('./src/parseCSV').accumulateCSV;
var shell = require('shelljs');
const fs = require('fs');
const iconv = require('iconv-lite');

const allFamiliesReading = accumulateCSV('ref/new_export_data.csv', 'school_id');
const allSchoolsReading = accumulateCSV('ref/school_class.csv', 'school_id');

Q.all([allFamiliesReading, allSchoolsReading]).then(arr => {
  const families = arr[0];
  const schools = arr[1];
  _.each(schools, _.flow([fillIn(families), exportSchool]))
}).catch(err => console.log(`school ${school.school_id} retrieve err`, err));


const mapChild = f => ({name: f.name, phone: f.phone});
const mapParent = f => ({name: f.parent, phone: f.phone, relationship: f.relationship});
const mapClass = clz => ({id: clz.class_id, school: clz.school_id, name: clz.class_name});

function fillIn(families) {
  return school => {
    const schoolId = school[0].school_id;
    // console.log(families[schoolId]);
    const family = _.uniqBy(families[schoolId], 'name');
    // console.log(family);
    const byClass = _.groupBy(family, 'class_id');
    return {
      id: schoolId,
      name: school[0].full_name,
      classes: _(school).map(clz => _.assign({}, mapClass(clz), {children: _.map(byClass[clz.class_id], mapChild)}, {parents: _.map(byClass[clz.class_id], mapParent)}))
        .reject(clz => _.isEmpty(clz.children)).value()
    }
  }
}

function exportSchool(school) {
  _.each(school.classes, clz => {
    const classFolder = `./out/result/${school.name}/${clz.name}/`;
    shell.mkdir('-p', classFolder);

    fs.writeFile(`${classFolder}/book1.csv`, iconv.encode(toChilrenCSV(clz.children), 'gbk'), err => {
      if(err) throw err
    });

    fs.writeFile(`${classFolder}/book2.csv`, iconv.encode(toParentCSV(clz.parents), 'gbk'), err => {
      if(err) throw err
    });
  })
}

function toChilrenCSV(children) {
  const title = '学生姓名,学号,联系电话,职务,性别,考勤卡号'
  const content = _.join(_.map(children, child => `${child.name},${child.phone},${child.phone},1,1,`), '\n');
  return _.join([title, content], '\n')
}

function toParentCSV(parents) {
  const title = '学号,定制手机号码,家长姓名,与子女关系,联系电话,家庭住址,备注'
  const content = _.join(_.map(parents, p => `${p.phone},${p.phone},${p.name},${p.relationship},1,1,1`), '\n');
  return _.join([title, content], '\n')
}