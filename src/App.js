import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Canvas from './Canvas';
import photos from './data/colors.json';

var width = 1500;
var height = 1800;
var backgroundColor = chroma('#273547').darken().hex();
var fontColor = chroma('#273547').brighten(4).hex();

// var xScale = d3.scaleLinear().domain([-180, 180]).range([0, width]);
var timeScale = d3.scaleTime().range([0, 360]);
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
    var perRow = 3;
    var tripSize = 400;

    var trips = _.chain(photos)
      .filter(photo => {
        photo.date = photo.date && new Date(photo.date);
        return photo.date;
      }).groupBy(photo => photo.tripId)
      .map((photos, tripId) => {
        // first calculate trip position
        var x = (index % perRow + .5) * tripSize;
        var y = (Math.floor(index / perRow) + .5) * tripSize;
        index += 1;
        // then get start and end dates of the trip
        var startDate = _.minBy(photos, photo => photo.date).date;
        var endDate = _.maxBy(photos, photo => photo.date).date;
        startDate = d3.timeDay.floor(startDate);
        endDate = d3.timeDay.ceil(endDate);
        timeScale.domain([startDate, endDate]);

        var colors = _.chain(photos)
          .map((photo) => {
            var hour = d3.timeHour.floor(photo.date);
            var angle = timeScale(hour);
            var focusX = -Math.cos(angle) * (tripSize / 2);
            var focusY = Math.sin(angle) * (tripSize / 2);

            return _.map(photo.colors, color => {
              if (chroma.contrast(backgroundColor, color) < 4.5) {
                // if contrast is low, up the saturation
                color = chroma(color).brighten().saturate(2).hex();
              } else {
                color = chroma(color).saturate(2).hex();
              }

              return {
                id: photo.id,
                tripId,
                date: photo.date,
                focusX,
                focusY,
                geo: photo.geo,
                color: color,
              };
            });
          }).flatten().value();

        return {
          x,
          y,
          colors,
          id: tripId,
        }
      }).value();

    this.setState({trips});
  },

  render() {
    return (
      <div className="App">
        <Canvas {...this.state} />
      </div>
    );
  }
});

export default App;
