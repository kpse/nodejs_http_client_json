var template = {
  "school_info": {
    "source_id": "",
    "school_name": "",
    "school_description": "",
    "province": "",
    "city": "",
    "area": "",
    "detailed_address": "",
    "school_linkphone": "",

    "master_info": {
      "source_master_id": "",
      "mobile": "",
      "name": "",
      "password": "",
      "introduction": ""
    },

    "class_list": [{
      "source_class_id": "",
      "class_name": "",
      "is_graduation": "0"
    }],

    "child_list": [{
      "source_child_id": "",
      "name": "",
      "source_class_id": "",
      "birthday": "yyyy-MM-dd 00:00:00",
      "sex": "", //0-未知，1-男，2-女
      "is_graduation": "", //0-否，1-是
      "is_in_school": "" //0-否，1-是
    }],

    "teacher_list": [{
      "source_teacher_id": "",
      "mobile": "",
      "name": "",
      "password": "",
      "birthday": "",
      "sex": "", //0-未知，1-男，2-女
      "source_class_id": ""
    }],

    "parent_list": [{
      "source_parent_id": "",
      "mobile": "",
      "name": "",
      "password": "",
      "source_child_id": "",
      "relation_type": ""//与孩子的关系，4-爸爸,5-妈妈,6-爷爷,7-姥姥,8-亲属,10-姥爷,11-奶奶
    }]
  }
};
