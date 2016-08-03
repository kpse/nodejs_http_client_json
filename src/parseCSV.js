var Q = require('q');
var fs = require('fs');
var csv = require('csv-parser');

function parseCSV(fileName, fieldName) {
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

function mapCSV(fileName) {
  var deferred = Q.defer();
  var result = [];
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', function (data) {
      // console.log(data);
      result.push(data);
    }).on('end', function () {
    deferred.resolve(result);
  });
  return deferred.promise;
}

function accumulateCSV(fileName, fieldName) {
  var fieldName = fieldName || 'sender';
  var fileName = fileName;
  var deferred = Q.defer();
  var dic = {};
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', function (data) {
      var existing = dic[data[fieldName]] || [];
      existing.push(data);
      dic[data[fieldName]] = existing;
    }).on('end', function () {
    deferred.resolve(dic);
  });
  return deferred.promise;
}

module.exports = {
  parseCSV: parseCSV,
  mapCSV: mapCSV,
  accumulateCSV: accumulateCSV
}