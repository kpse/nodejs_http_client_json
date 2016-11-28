'use strict';

exports.relationshipTranslate = relationshipName => {
  //与孩子的关系，4-爸爸,5-妈妈,6-爷爷,7-姥姥,8-亲属,10-姥爷,11-奶奶
  if (relationshipName == '爸爸') {
    return '4';
  } else if (relationshipName == '妈妈') {
    return '5';
  } else if (relationshipName == '爷爷') {
    return '6';
  } else if (relationshipName == '姥姥') {
    return '7';
  } else if (relationshipName == '姥爷') {
    return '10';
  } else if (relationshipName == '奶奶') {
    return '11';
  } else return '8';
}
