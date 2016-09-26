import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

var radius = 4;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide(radius / 2))
  .alphaMin(.25);

var Canvas = React.createClass({
  componentDidMount() {
    this.svg = d3.select(this.refs.svg);

    this.circles = this.svg.selectAll('circle')
      .data(this.props.colors, (d) => d.id)
      .enter().append('circle')
      .attr('r', radius)
      .attr('fill', (d) => d.color);

    simulation
      .force('center', d3.forceCenter(this.props.width / 2, this.props.height / 2))
      .nodes(this.props.colors)
      .on('tick', this.forceTick.bind(this));
  },

  forceTick() {
    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')')
  },

  render() {
    return (
      <svg width={this.props.width} height={this.props.height} ref='svg' />
    );
  }
});

export default Canvas;
