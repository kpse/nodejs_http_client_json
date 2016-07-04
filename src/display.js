function genderDisplay(gender) {
  return gender == 0 ? '1' : '2';
}

function timeDisplay(timestamp) {
  return new Date(Number(timestamp)).toISOString().slice(0, 19).replace(/T/g, " ");
}

module.exports = {
  gender: genderDisplay,
  time: timeDisplay
}