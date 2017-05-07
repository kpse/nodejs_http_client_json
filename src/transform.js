'use strict'

const display = require('./display');
const relationshipTranslate = require('./relationship');
const _ = require('lodash');

function parents(relationships) {
  // console.log('transformParents', relationships);
  return _(relationships).map((r) => ({
    "source_parent_id": r.parent.parent_id,
    "mobile": r.parent.phone,
    "name": r.parent.name,
    "password": r.password,
    "avatar": r.parent.portrait,
    "sex": display.gender(r.parent.gender),
    "source_child_id": r.child.child_id,
    "relation_type": relationshipTranslate(r.relationship)
  })).groupBy('source_parent_id').map(function (family) {
    // console.log('in group by', family);
    const parent = family[0];
    if (family.length > 1) {
      const children = _.map(family, p => p["source_child_id"]);
      const relationships = _.map(family, p => p["relation_type"]);
      parent["source_child_id"] = children;
      parent["relation_type"] = relationships;
      console.log('multiple children parent: ', parent);
      return parent;
    }
    // console.log('single child parent: ', parent);
    parent["source_child_id"] = [parent["source_child_id"]];
    parent["relation_type"] = [parent["relation_type"]];
    return parent;
  }).value();
}
function children(relationships) {
  // console.log('transformChildren', relationships);
  return _(relationships).uniqBy('child.child_id').map(r => ({
    "source_child_id": r.child.child_id,
    "name": r.child.name,
    "source_class_id": r.child.class_id.toString(),
    "birthday": r.child.birthday + " 00:00:00",
    "sex": display.gender(r.child.gender), //0-未知，1-男，2-女
    "is_graduation": "0", //0-否，1-是
    "is_in_school": "1" //0-否，1-是
  })).value();
}

function employees(employees) {
  // console.log('transformEmployees', employees);
  return _.map(employees, e => ({
    "source_teacher_id": e.id,
    "mobile": e.phone,
    "name": e.name,
    "password": e.password,
    "birthday": `${e.birthday} 00:00:00`,
    "sex": display.gender(e.gender), //0-未知，1-男，2-女
    "avatar": e.portrait,
    "source_class_id": e.subordinate
  }));
}

function classes(classes) {
  return _.map(classes, c => ({
    "source_class_id": c.class_id.toString(),
    "class_name": c.name,
    "is_graduation": "0"
  }));
}

const mapToTeachers = function (sessions) {
  const compactSessions = _.uniqBy(sessions, duplicated => {
    const key = duplicated.sender + '_' + Math.round(Number(duplicated.update_at) / 500) + '' + duplicated.content + '_' + duplicated.media_url;
    // console.log('unique key = ', key);
    return key;
  });
  // console.log('compactSessions', compactSessions);
  return _.map(compactSessions, s => {
    const item = {
      "source_teacher_id": s.sender,
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type === 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }

    return item;
  });
}

const mapToParents = sessions => {
  return _.map(sessions, s => {
    const item = {
      "source_parent_id": s.sender,
      "source_child_id": retrieveChildId(s.session_id),
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type === 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }
    return item;
  });
};

const mapToNews = news => _.map(news, s => ({
  "source_person_id": s.publisher_id,
  "role": '1',
  "notify_type": '1',
  "source_class_id": [s.class_id + ''],
  "content": s.content,
  "img_path": [s.image],
  "video_path": "",
  "create_time": display.time(s.update_at)
}));

function retrieveChildId(sessionId) {
  return sessionId.substring(2);
};

function pickUpPrincipal(employees) {
  // console.log('pickUpPrincipal', employees);
  const principal = _.find(employees, function (e) {
    return e.privilege_group === 'principal';
  });
  return principal === undefined ? {} : {
    "source_master_id": principal.id,
    "mobile": principal.phone,
    "name": principal.name,
    "password": principal.password,
    "sex": display.gender(principal.gender),
    "introduction": ""
  };
}


module.exports = {
  parents,
  children,
  employees,
  classes,
  mapToTeachers,
  pickUpPrincipal,
  mapToParents,
  mapToNews
};