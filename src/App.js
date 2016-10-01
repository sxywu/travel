import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Trip from './Trip';
import photos from './data/more_colors.json';
import tripsData from './data/trips.json';

var width = 800;
var height = 1200;
var backgroundColor = chroma('#273547').darken().hex();
var fontColor = chroma('#273547').brighten(4).hex();

var maxWidth = 500;
var sizeScale = d3.scaleLinear().range([maxWidth / 2, maxWidth]);
var radiusScale = d3.scaleLinear().domain([0, 360]);
var angleScale = d3.scaleLinear().range([-.5 * Math.PI, 1.5 * Math.PI]);
var xScale = d3.scaleLinear().domain([-180, 180]).range([0, width]);
var yScale = d3.scaleLinear().domain([2012, 2016]).range([height, 0]);

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
      var trip = _.find(tripsData, trip => trip.id === tripId);
      var tripSize = sizeScale(photos.length);
      radiusScale.range([tripSize * .1, tripSize * .45]);

      // first calculate trip position
      var x = xScale(trip.geo[1]);
      var y = yScale(trip.year);

      // then get start and end dates of the trip
      var startDate = _.minBy(photos, photo => photo.date).date;
      var endDate = _.maxBy(photos, photo => photo.date).date;
      startDate = d3.timeDay.floor(startDate);
      endDate = d3.timeDay.ceil(endDate);
      angleScale.domain([startDate, endDate]);
      // now get all the days between start and end
      var days = d3.timeDay.range(startDate, endDate, 1);
      days = _.map(days, (day, index) => {
        var angle = angleScale(day);
        return {
          index,
          day,
          angle,
          x1: Math.cos(angle) * (tripSize * .25),
          y1: Math.sin(angle) * (tripSize * .25),
          x2: Math.cos(angle) * (tripSize * .35),
          y2: Math.sin(angle) * (tripSize * .35),
        }
      });

      var colors = _.chain(photos)
        .map((photo) => {
          var hour = d3.timeHour.floor(photo.date);
          var angle = angleScale(hour);

          return _.map(photo.colors, color => {
            if (chroma.contrast(backgroundColor, color) < 4.5) {
              // if contrast is low, up the saturation
              color = chroma(color).brighten(2).saturate(2);
            } else {
              color = chroma(color).saturate(2);
            }
            // if there's no hue, then don't show it
            if (!color.hsv()[0]) return;

            var hue = (color.hsv()[0] + 120) % 360;
            var radius = radiusScale(hue);
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
        days,
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
