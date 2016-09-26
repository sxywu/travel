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

var meta = {};
var index = 0;
function compressImage(folder, folders, filename, files) {
  console.log('filename', folder, filename, index);
  if (_.isEmpty(files)) {
    fs.writeFile('metadata.json', JSON.stringify(meta), 'utf8');
    // if there are also no more folders, stop
    if (_.isEmpty(folders)) {
      return;
    }

    // if there are no more files, go to next folder
    index = 0;
    folder = folders.pop();
    processFolder(folder, folders);
    return;
  }

  gm('photos/' + folder + '/' + filename)
    .identify(function(err, data) {
      if (err) {
        console.log(err);
        return;
      }

      data = data['Profile-EXIF'];
      var date = data['Date Time'];
      var name = folder + '-' + index + '.jpg';

      var m = [name];
      m.push(date);

      var lat = data['GPS Latitude'];
      var long = data['GPS Longitude'];
      if (lat && long) {
        lat = ParseDMS(data['GPS Latitude Ref'], lat);
        long = ParseDMS(data['GPS Longitude Ref'], long);
        m.push([lat, long]);
      }
      console.log('meta', m)
      meta[folder].push(m);

      gm('photos/' + folder + '/' + filename)
        .resize(8, 8, '!')
        .write('processed/' + name, function (err) {
          if (err) {
            console.log(err);
            return;
          }

          index += 1;
          filename = files.pop();
          compressImage(folder, folders, filename, files);
        });
    })
    // .resize(10, 10, '!')
    // .colors(3)
    // .blur(5, 3)
    // .write('processed/' + index + '.jpg', function (err) {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //
    //
    // });
}

function processFolder(folder, folders) {
  fs.readdir('photos/' + folder, function(err, files) {
    files = _.filter(files, function(file, i) {
      return (i % 5 === 0) && _.last(file.split('.')) === 'jpg';
    });

    // create object
    meta[folder] = [];

    var file = files.pop();
    compressImage(folder, folders, file, files);
  });
}

fs.readdir('photos/', function(err, folders) {
  folders = _.filter(folders, function(folder) {return folder !== '.DS_Store'});
  var folder = folders.pop();
  console.log('folders', folders);
  processFolder(folder, folders);
});
