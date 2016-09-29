import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import Trip from './Trip';

var Trips = React.createClass({
  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.defineFilters();
  },

  defineFilters() {
    //SVG filter for the gooey effect
    //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
    var defs = this.svg.append('defs');
    var gooey = defs.append('filter').attr('id','gooey');
    gooey.append('feGaussianBlur')
      .attr('in','SourceGraphic')
      .attr('stdDeviation','1.75')
      .attr('result','blur');
    gooey.append('feColorMatrix')
      .attr('in','blur')
      .attr('mode','matrix')
      .attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
  },

  render() {
    var trips = _.map(this.props.trips, trip => {
      return (
        <Trip {...this.props} {...trip} />
      );
    });
    return (
      <svg width={this.props.width} height={this.props.height} ref='svg'>
        {trips}
      </svg>
    );
  }
});

export default Trips;
