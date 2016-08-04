var display = require('./display');
var relationshipTranslate = require('./relationship');
var _ = require('lodash');

function transformParents(relationships) {
  // console.log('transformParents', relationships);
  return _(relationships).map(function (r) {
    return {
      "source_parent_id": r.parent.parent_id,
      "mobile": r.parent.phone,
      "name": r.parent.name,
      "password": r.password,
      "sex": display.gender(r.parent.gender),
      "source_child_id": r.child.child_id,
      "relation_type": relationshipTranslate(r.relationship)
    };
  }).groupBy('source_parent_id').map(function (family) {
    // console.log('in group by', family);
    var parent = family[0];
    if (family.length > 1) {
      var children = _.map(family, function (p) {
        return p["source_child_id"];
      });
      var relationships = _.map(family, function (p) {
        return p["relation_type"];
      });
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
function transformChildren(relationships) {
  // console.log('transformChildren', relationships);
  return _(relationships).uniqBy('child.child_id').map(function (r) {
    return {
      "source_child_id": r.child.child_id,
      "name": r.child.name,
      "source_class_id": r.child.class_id.toString(),
      "birthday": r.child.birthday + " 00:00:00",
      "sex": display.gender(r.child.gender), //0-未知，1-男，2-女
      "is_graduation": "0", //0-否，1-是
      "is_in_school": "1" //0-否，1-是
    };
  }).value();
}

function transformEmployees(employees) {
  // console.log('transformEmployees', employees);
  return _.map(employees, function (e) {
    return {
      "source_teacher_id": e.id,
      "mobile": e.phone,
      "name": e.name,
      "password": e.password,
      "birthday": e.birthday + " 00:00:00",
      "sex": display.gender(e.gender), //0-未知，1-男，2-女
      "source_class_id": e.subordinate
    };
  });
}

function transformClass(classes) {
  return _.map(classes, function (c) {
    return {
      "source_class_id": c.class_id.toString(),
      "class_name": c.name,
      "is_graduation": "0"
    };
  });
}

var mappingTeacherSessions = function (sessions) {
  return _.map(sessions, function (s) {
    var item = {
      "source_teacher_id": s.sender,
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "is_public": "0",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type == 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }

    return item;
  });
}

var mappingParentSessions = function (sessions) {
  return _.map(sessions, function (s) {
    var item = {
      "source_parent_id": s.sender,
      "source_child_id": retrieveChildId(s.session_id),
      "content": s.content,
      "img_path": [],
      "video_path": "",
      "is_public": "0",
      "create_time": display.time(s.update_at)
    };
    if (s.media_type == 'video') {
      item["video_path"] = s.media_url;
    } else {
      item["img_path"] = s.media_url.split('  ');
    }
    return item;
  });
};

function retrieveChildId(sessionId) {
  return sessionId.substring(2);
}


module.exports = {
  parents: transformParents,
  children: transformChildren,
  employees: transformEmployees,
  classes: transformClass,
  mapToTeachers: mappingTeacherSessions,
  mapToParents: mappingParentSessions
};