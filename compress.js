var fs = require('fs');
var gm = require('gm');
var _ = require('lodash');

function ParseDMS(ref, dms) {
    dms = _.map(dms.split(','), function(d) {
      d = d.split('/');
      return parseInt(d[0]) / parseInt(d[1]);
    });
    return ConvertDMSToDD(dms[0], dms[1], dms[2], ref);
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

var index = 0;
function compressImage(filename, photos) {
  console.log(filename);
  gm('photos/' + filename)
    .resize(20, 20, '!')
    .dither()
    .colors(4)
    // .identify(function (err, data) {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //   data = data['Profile-EXIF'];
    //   var date = data['GPS Date Stamp'];
    //   date = date && date.replace(/\:/g, '/');
    //
    //   var m = [];
    //   m.push(date);
    //
    //   var lat = data['GPS Latitude'];
    //   var long = data['GPS Longitude'];
    //   if (lat && long) {
    //     lat = ParseDMS(data['GPS Latitude Ref'], lat);
    //     long = ParseDMS(data['GPS Longitude Ref'], long);
    //     m.push([lat, long]);
    //   }
    //   console.log(m)
    //   meta.push(m);
    // })
    .write('processed/' + index + '.jpg', function (err) {
      if (err) {
        console.log(err);
        return;
      }
      // pop the next photo and load it until there is no more
      if (_.isEmpty(photos)) {
        // if it's done, save the data
        // fs.writeFile('metadata.json', JSON.stringify(meta), 'utf8');
        return;
      }

      index += 1;
      var photo = photos.pop();
      compressImage(photo, photos);

    });
}

var meta = [];
fs.readdir('photos/', function(err, files) {
  files = _.filter(files, function(file, i) {
    return (i % 10 === 0) && _.last(file.split('.')) === 'jpg';
  });
  var file = files.pop();
  compressImage(file, files);
});
