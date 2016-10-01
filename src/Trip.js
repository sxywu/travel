import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var radius = 1;
var Trip = React.createClass({
  componentWillMount() {
    this.simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide(radius))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .alphaMin(.1);
  },

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');

    this.svg = d3.select(this.refs.svg)
      .append('g')
      .attr('transform', (d) =>
        'translate(' + [this.props.size / 2, this.props.size / 2] + ')');

    // add in trip name
    var fontSize = 14;
    this.svg.append('text')
      .attr('y', -fontSize - 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize - 2)
      .attr('dy', '.35em')
      .attr('fill', this.props.fontColor)
      .attr('opacity', .5)
      .text(this.props.year);
    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', this.props.fontColor)
      .attr('font-size', fontSize)
      .text(this.props.name);

    // add in markers
    this.svg.append('g')
      .classed('markers', true)
      .attr('fill', 'none')
      .attr('stroke', this.props.fontColor)
      .attr('opacity', .2)
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
    if (this.simulation.alpha() > .8) return;

    // clear canvas
    this.ctx.clearRect(0, 0, this.props.size, this.props.size);
    _.each(this.props.colors, color => {
      this.ctx.beginPath();
      this.ctx.arc(color.x + this.props.size / 2, color.y + this.props.size / 2,
        radius, 0, 2 * Math.PI, true);
      this.ctx.fillStyle = color.color;
      this.ctx.fill();
    });
  },

  render() {
    var style = {
      position: 'relative',
      display: 'inline-block',
      verticalAlign: 'middle',
    };
    var canvasStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
    }
    return (
      <span style={style}>
        <svg ref='svg'
          width={this.props.size} height={this.props.size} />
        <canvas style={canvasStyle} ref='canvas'
          width={this.props.size} height={this.props.size}  />
      </span>
    );
  }
});

export default Trip;
