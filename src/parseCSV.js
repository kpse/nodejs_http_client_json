var Q = require('q');
var fs = require('fs');
var csv = require('csv-parser');

module.exports = function parseCSV(fileName, fieldName) {
  var fieldName = fieldName || 'sender';
  var fileName = fileName;
  var deferred = Q.defer();
  var dic = {};
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', function (data) {
      // console.log(data);
      dic[data[fieldName]] = data
    }).on('end', function () {
    deferred.resolve(dic);
  });
  return deferred.promise;
}