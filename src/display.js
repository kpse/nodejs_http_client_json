function gender(gender) {
  return gender == 0 ? '2' : '1';
}

function time(timestamp) {
  return new Date(Number(timestamp) + 8 * 3600000).toISOString().slice(0, 19).replace(/T/g, " ");
}

function digitalTime(ts) {
  return new Date(ts + 8 * 3600000).toISOString().replace('T', ' ').replace(/\..+/, '');
}

module.exports = {
  gender, digitalTime, time
}