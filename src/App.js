import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Canvas from './Canvas';
import photos from './data/colors.json';

var width = 2000;
var height = 2000;
var backgroundColor = chroma('#273547').darken().hex();
var xScale = d3.scaleLinear().domain([-180, 180]).range([0, width]);
var timeScale = d3.scaleTime()
  .domain([new Date('1/1/2012'), new Date('12/31/2016')])
  .range([0, height]);
var App = React.createClass({
  getInitialState() {
    return {
      width,
      height,
      colors: [],
    };
  },

  componentWillMount() {
    var colors = _.chain(photos)
      .map((photo) => {
        return _.map(photo.colors, color => {
          if (chroma.contrast(backgroundColor, color) < 4.5) {
            // if contrast is low, up the saturation
            color = chroma(color).brighten().saturate(2).hex();
          } else {
            color = chroma(color).saturate(2).hex();
          }
          var date = photo.date && new Date(photo.date);
          if ((date ? timeScale(date) : 0) < 0) debugger
          return {
            id: photo.id,
            tripId: photo.tripId,
            date,
            geo: photo.geo,
            focusX: photo.geo ? xScale(photo.geo[1]) : 0,
            focusY: date ? timeScale(date) : 0,
            color: color,
          };
        });
      }).flatten().value();

    this.setState({colors});
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
