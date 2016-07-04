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
      "source_child_id": r.child.child_id,
      "relation_type": relationshipTranslate(r.relationship)
    };
  }).groupBy('source_parent_id').map(function (family) {
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
    parent["source_child_id"] = [parent["source_child_id"]];
    parent["relation_type"] = [parent["relation_type"]];
    return parent;
  }).values();

}
function transformChildren(relationships) {
  // console.log('transformChildren');
  return _.map(relationships, function (r) {
    return {
      "source_child_id": r.child.child_id,
      "name": r.child.name,
      "source_class_id": r.child.class_id.toString(),
      "birthday": r.child.birthday + " 00:00:00",
      "sex": display.gender(r.child.gender), //0-未知，1-男，2-女
      "is_graduation": "0", //0-否，1-是
      "is_in_school": "1" //0-否，1-是
    };
  })
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

module.exports = {
  parents: transformParents,
  children: transformChildren,
  employees: transformEmployees,
  classes: transformClass
};