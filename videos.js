'use strict';

const _ = require('lodash');
const Q = require('q');
const csv = require('./src/parseCSV');
const fs = require('fs');

const env = '';

const mapCSV = csv.mapCSV;


const promiseOfSessions = mapCSV('ref/e_session.' + env + 'csv');

promiseOfSessions.then((sessions) => {
  const result = _(sessions)
    .filter(nonVideo => nonVideo.media_type === "video")
    .map(video => video.media_url.split('  '))
    .flatten().uniq().value();

  console.log(sessions.length);
  console.log(result.length);

  // console.log(result);
  const logStream = fs.createWriteStream('out/all_urls.txt', {'flags': 'a'});
  _.each(result, line => logStream.write(line + '\n'));
  logStream.end();
  console.log('write urls done.');
});
