const Q = require('q');
const fs = require('fs');
const csv = require('csv-parser');

function parseCSV(fileName, fieldName) {
  const file = fieldName || 'sender';
  const deferred = Q.defer();
  const dic = {};
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', data => dic[data[file]] = data)
    .on('end', () => deferred.resolve(dic));
  return deferred.promise;
}

function parseCSVWithIndex(fileName, index) {
  const file = fileName;
  const deferred = Q.defer();
  const dic = {};
  fs.createReadStream(file)
    .pipe(csv())
    .on('data', data => dic[data[data.headers[index]]] = data)
    .on('end', () => deferred.resolve(dic));
  return deferred.promise;
}

function mapCSV(fileName) {
  const deferred = Q.defer();
  const result = [];
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', data => result.push(data))
    .on('end', () => deferred.resolve(result));
  return deferred.promise;
}

function accumulateCSV(fileName, fieldName) {
  const file = fieldName || 'sender';
  const deferred = Q.defer();
  const dic = {};
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', data => {
      var existing = dic[data[file]] || [];
      existing.push(data);
      dic[data[file]] = existing;
    }).on('end', () => deferred.resolve(dic));
  return deferred.promise;
}

module.exports = {
  parseCSV, mapCSV, parseCSVWithIndex, accumulateCSV
}