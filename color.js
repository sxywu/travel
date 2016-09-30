var fs = require('fs');
var gm = require('gm');
var _ = require('lodash');
var getColors = require("get-image-colors")

var newMeta = [];
function getColorsForImage(m, meta) {
  if (_.isEmpty(meta)) {
    // if there's no morew photos, save it!
    fs.writeFile('colors.json', JSON.stringify(newMeta), 'utf8');
    return;
  }
  getColors('processed/' + m.id, function(err, colors){
    // colors is an array of colors
    colors = _.map(colors, function(color) {
      return color.hex();
    });
    m.colors = colors;
    newMeta.push(m);
    console.log(m);

    m = meta.pop();
    getColorsForImage(m, meta);
  });
}

fs.readFile('metadata.json', 'utf8', function(err, metadata) {
  metadata = JSON.parse(metadata);
  var meta = _.chain(metadata)
    .map(function(photos, tripId) {
      return _.map(photos, function(photo) {
        var date = photo[2] && photo[2].split(' ');
        var time = date && date[1];
        date = date && date[0].replace(/:/g, '/');
        date = date && date + ' ' + time;

        return {
          id: photo[0],
          filename: photo[1],
          tripId: tripId,
          date: date,
          geo: photo[3],
        }
      });
    }).flatten().value();

  var m = meta.pop();
  getColorsForImage(m, meta);
});
