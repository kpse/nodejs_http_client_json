var jsonfile = require('jsonfile');
var fs = require('fs');


function writeToFile(filename, obj) {
  var file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

function dynamicInfoOutput(filename, obj) {
  var file = './out-dynamic/dynamic-' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

var isFileExisting = function (name) {
  try {
    fs.accessSync('./out/' + name + '.json', fs.F_OK);
    return true;
  } catch (e) {
  }
  return false;
};


module.exports = {
  write: writeToFile,
  isExisting: isFileExisting,
  dynamicOutput: dynamicInfoOutput
}