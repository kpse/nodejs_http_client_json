const employeeCard = (range) => `
SELECT c.uid, \n\
       e.\`school_id\`, \n\
       e.employee_id, \n\
       name, \n\
       card \n\
  FROM \`prod\`.\`employeecard\` c \n\
  INNER JOIN \`employeeinfo\` e on e.\`uid\`= c.\`employee_id\` \n\
  INNER JOIN \`cardrecord\` cd on c.\`card\`= cd.\`origin\` \n\
where e.\`status\`= 1 \n\
   and c.\`school_id\` in (${range}) \n\
   and c.\`status\`= 1
`

const childrenCard = (range) => `
SELECT e.uid,
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
where school_id in (${range}))
`

const eClass = range => `
SELECT e.uid, e.\`school_id\`,
       e.\`employee_id\`,
       case p.\`group\` WHEN 'teacher' THEN \`subordinate\` else(
select class_id
  from \`classinfo\`
WHERE \`school_id\`= e.\`school_id\`
LIMIT 1) end as subordinate,
       p.\`group\`
  FROM \`prod\`.\`employeeinfo\` e
  left OUTER JOIN \`privilege\` p on e.\`employee_id\`= p.\`employee_id\`
   and p.\`status\`= 1
   and \`group\`<> 'operator'
where e.\`school_id\` in (${range})
   and e.\`status\`= 1
`

const pSession = range => `
select uid,
       school_id,
       \`session_id\`,
       \`content\`,
       \`media_url\`,
       \`media_type\`,
       sender,
       \`update_at\`
  from \`sessionlog\`
where \`status\`= 1
   and \`sender_type\`= 'p' and \`session_id\` LIKE 'h_%'
and \`school_id\` in (${range})
`

const eSession = range => `
select uid,
       school_id,
       \`session_id\`,
       \`content\`,
       \`media_url\`,
       \`media_type\`,
       sender,
       \`update_at\`
  from \`sessionlog\`
where \`status\`= 1
   and \`sender_type\`= 't' and \`session_id\` LIKE 'h_%'
and \`school_id\` in (${range})
`

const ePass = range => `
SELECT uid,
       school_id,
       employee_id,
       gender,
       picurl,
       phone,
       login_password
  FROM \`employeeinfo\`
WHERE status= 1
   and \`school_id\` in (${range})
`

const pPass = range => `
SELECT a.uid, phone,
       password
  from \`accountinfo\` a
  INNER JOIN \`parentinfo\` on \`phone\`= accountid
WHERE status= 1
   and \`school_id\` in (${range})
`

const schoolInfo = range => `
SELECT uid,
       school_id,
       full_name
  FROM \`schoolinfo\`
WHERE status= 1
   and \`school_id\` in (${range})
`

const news = range => `
SELECT uid,
       \`school_id\`,
       \`class_id\`,
        replace(to_base64(content), '\n', '') \`content\`,
       \`image\`,
       \`update_at\`,
       \`publisher_id\`
  FROM \`location\`.\`news\`
 wHERE \`published\`= 1
   and \`status\`= 1
   and \`school_id\` in (${range})
`

module.exports = {
  employeeCard, childrenCard, eClass, pSession, eSession, ePass, pPass, schoolInfo, news
}