import React from 'react';
import * as d3 from 'd3';

var radius = 2;
var Trip = React.createClass({
  componentWillMount() {
    this.simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide(radius + 1))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY));
  },

  componentDidMount() {
    this.trip = d3.select(this.refs.trip)
      .attr('transform', (d) =>
        'translate(' + [this.props.x, this.props.y] + ')');

    // add in trip name
    this.trip.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', this.props.fontColor)
      .text(this.props.id);

    // all the colors
    this.circles = this.trip
      .append('g').classed('circles', true)
      // .style("filter", "url(#gooey)")
      .selectAll('circle')
      .data(this.props.colors, d => d.id)
      .enter().append('circle')
      .attr('r', radius)
      .attr('fill', (d) => d.color);

    // add in markers
    this.trip.append('g')
      .classed('markers', true)
      .attr('fill', 'none')
      .attr('stroke', this.props.fontColor)
      .attr('opacity', .25)
      .selectAll('line')
      .data(this.props.days)
      .enter().append('line')
      .attr('x1', (d) => d.x1)
      .attr('x2', (d) => d.x2)
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2);

    this.simulation
      .nodes(this.props.colors)
      .on('tick', this.forceTick.bind(this));
  },

  forceTick() {
    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')')
  },

  render() {
    return (
      <g ref='trip' />
    );
  }
});

export default Trip;
