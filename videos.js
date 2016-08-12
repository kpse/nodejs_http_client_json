var _ = require('lodash');
var Q = require('q');
var csv = require('./src/parseCSV');
var fs = require('fs');

var env = '';
// var env = 'stage2.';

var mapCSV = csv.mapCSV;


var promiseOfSessions = mapCSV('ref/e_session.' + env + 'csv');

promiseOfSessions.then(function (sessions) {
  var result = _(sessions).filter(function (nonVideo) {
    return nonVideo.media_type == "video";
  }).map(function (video) {
    return video.media_url.split('  ');
  }).flatten().uniq().value();
  console.log(sessions.length);
  console.log(result.length);
  // console.log(result);
  var logStream = fs.createWriteStream('out/all_urls.txt', {'flags': 'a'});
  _.each(result, function (line) {
    logStream.write(line + '\n');
  });
  logStream.end();
  console.log('write urls done.');
});
