import React from 'react';
import _ from 'lodash';

import Canvas from './Canvas';
import metadata from './data/metadata.json';

var App = React.createClass({
  getInitialState() {
    return {
      trips: [],
    };
  },

  componentWillMount() {
    var trips = _.map(metadata, (photos, tripId) => {
      return _.map(photos, photo => {
        var date = photo[1] && photo[1].split(' ');
        var time = date && date[1];
        date = date && date[0].replace(/:/g, '/');
        date = date && date + ' ' + time;
        date = date && new Date(date);

        return {
          id: photo[0],
          image: require('./img/' + photo[0]),
          tripId,
          date,
          geo: photo[2],
        };
      });
    });

    console.log(trips);
  },

  render() {
    return (
      <div className="App">
        <Canvas />
      </div>
    );
  }
});

export default App;
