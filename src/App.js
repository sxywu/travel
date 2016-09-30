import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Trip from './Trip';
import photos from './data/more_colors.json';

var width = 1600;
var height = 6400;
var backgroundColor = chroma('#273547').darken().hex();
var fontColor = chroma('#273547').brighten(4).hex();

var maxWidth = 600;
var sizeScale = d3.scaleLinear().range([100, maxWidth]);
var radiusScale = d3.scaleLinear();
var angleScale = d3.scaleLinear().domain([0, 360])
  .range([-.5 * Math.PI, 1.5 * Math.PI]);

var App = React.createClass({
  getInitialState() {
    return {
      width,
      height,
      fontColor,
      trips: [],
    };
  },

  componentWillMount() {
    var index = 0;
    var perRow = 2;

    var trips = _.chain(photos)
      .filter(photo => {
        photo.date = photo.date && new Date(photo.date);
        return photo.date;
      }).sortBy(photo => -photo.date)
      .groupBy(photo => photo.tripId).value();
    var maxPhotos = _.chain(trips).values().maxBy((photos) => photos.length).value().length;
    var minPhotos = _.chain(trips).values().minBy((photos) => photos.length).value().length;
    sizeScale.domain([minPhotos, maxPhotos]);

    trips = _.map(trips, (photos, tripId) => {
      var tripSize = sizeScale(photos.length);
      radiusScale.range([tripSize * .05, tripSize * .45]);

      // first calculate trip position
      var x = (index % perRow + .5) * maxWidth;
      var y = (Math.floor(index / perRow) + .5) * maxWidth;
      index += 1;

      // then get start and end dates of the trip
      var startDate = _.minBy(photos, photo => photo.date).date;
      var endDate = _.maxBy(photos, photo => photo.date).date;
      startDate = d3.timeDay.floor(startDate);
      endDate = d3.timeDay.ceil(endDate);
      radiusScale.domain([startDate, endDate]);
      // now get all the days between start and end
      // var days = d3.timeDay.range(startDate, endDate, 1);
      // days = _.map(days, (day, index) => {
      //   var angle = angleScale(day);
      //   return {
      //     index,
      //     day,
      //     angle,
      //     x1: Math.cos(angle) * (tripSize * .2),
      //     y1: Math.sin(angle) * (tripSize * .2),
      //     x2: Math.cos(angle) * (tripSize * .35),
      //     y2: Math.sin(angle) * (tripSize * .35),
      //   }
      // });

      var colors = _.chain(photos)
        .map((photo) => {
          var hour = d3.timeHour.floor(photo.date);
          var radius = radiusScale(hour);

          return _.map(photo.colors, color => {
            if (chroma.contrast(backgroundColor, color) < 4.5) {
              // if contrast is low, up the saturation
              color = chroma(color).brighten().saturate(2);
            } else {
              color = chroma(color).saturate(2);
            }
            // if there's no hue, then don't show it
            if (!color.hsv()[0]) return;

            var angle = angleScale(color.hsv()[0]);
            var focusX = Math.cos(angle) * radius;
            var focusY = Math.sin(angle) * radius;

            return {
              id: photo.id,
              tripId,
              date: photo.date,
              focusX,
              focusY,
              geo: photo.geo,
              color: color.hex(),
            };
          });
        }).flatten().filter().value();

      return {
        x,
        y,
        colors,
        // days,
        id: tripId,
        size: tripSize,
      }
    });

    this.setState({trips});
  },

  render() {
    var tripStyle = {fontColor: this.state.fontColor};
    var trips = _.map(this.state.trips, (trip) => {
      return <Trip {...trip} {...tripStyle} />
    });
    return (
      <div className="App">
        {trips}
      </div>
    );
  }
});

export default App;
