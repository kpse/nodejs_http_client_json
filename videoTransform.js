var fs = require('fs');
var csv = require('csv-parser');
var address = require('./src/address');
var LineByLineReader = require('line-by-line'),
  lr = new LineByLineReader('./ref/school_video.csv');


lr.on('line', function (line) {
  // 'line' contains the current line without the trailing newline character.
  var detailAddress = line.split(',')[2];
  console.log("address: ", detailAddress);
  var addressColumns = ',"' + address.provinceOf(detailAddress) + '","' + address.cityOf(detailAddress) + '","' + address.areaOf(detailAddress) + '"';
  fs.appendFileSync("./out/school_video.csv", line.toString() + addressColumns + "\n");
});


lr.on('end', function () {
  console.log('All lines are read, file is closed now.');
});

lr.on('error', function (err) {
  console.log('err contains error object', err);
});
