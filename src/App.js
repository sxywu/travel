import React from 'react';
import _ from 'lodash';
import chroma from 'chroma-js';

import Canvas from './Canvas';
import photos from './data/colors.json';

var backgroundColor = chroma('#273547').darken().hex();
var App = React.createClass({
  getInitialState() {
    return {
      width: 1400,
      height: 1400,
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

          return {
            id: photo.id,
            tripId: photo.tripId,
            date: photo.date && new Date(photo.date),
            geo: photo.geo,
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
