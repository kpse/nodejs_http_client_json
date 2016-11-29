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

var cardinfo = {
  "card_info": {
    "school_id": "",
    "school_name": "",
    "card_list": [
      {
        "card_no": "",
        "mac_id": "",
        "status": "",
        "type": "",
        "person_id": "",
        "person_name": "",
        "class_id": "",
        "class_name": "",
        "create_time": "",
        "origin": "youlebao"
      },
      {}
    ]
  }
};

const employeeCard = (range) => `SELECT c.uid, \n\
       e.\`school_id\`, \n\
       e.employee_id, \n\
       name, \n\
       card \n\
  FROM \`prod\`.\`employeecard\` c \n\
  INNER JOIN \`employeeinfo\` e on e.\`uid\`= c.\`employee_id\` \n\
  INNER JOIN \`cardrecord\` cd on c.\`card\`= cd.\`origin\` \n\
where e.\`status\`= 1 \n\
   and c.\`school_id\` in (${range}) \n\
   and c.\`status\`= 1`;

const childrenCard = (range) => `SELECT e.uid,
       e.\`school_id\`,
       e.\`child_id\`,
       e.\`name\`,
       card_num as card,
       ci.\`class_id\`,
       ci.\`class_name\`
  FROM \`prod\`.\`relationmap\` c
  INNER JOIN \`childinfo\` e on e.\`child_id\`= c.\`child_id\`
   and e.\`status\`= 1
  INNER JOIN \`cardrecord\` cd on c.\`card_num\`= cd.\`origin\`
   and cd.\`status\`= 1
  INNER JOIN \`classinfo\` ci on ci.\`class_id\`= e.\`class_id\`
   and ci.\`school_id\`= e.\`school_id\`
  INNER JOIN \`parentinfo\` p on p.\`parent_id\`= c.\`parent_id\`
   and p.\`status\`= 1
where e.\`status\`= 1
   and c.\`status\`= 1
   and length(\`card_num\`)= 10
   and e.\`child_id\` in (
select child_id
  from \`childinfo\`
where school_id in (${range}))`;

module.exports = {
  employeeCard, childrenCard
}