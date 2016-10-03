import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var radius = 1;
var arc = d3.arc()
  .padAngle(.05)
  .cornerRadius(3);
var hoverArc = d3.arc();
var red = '#E94E77';
var dateFormat = d3.timeFormat('%b %e');

var Trip = React.createClass({
  getInitialState() {
    return {
      hovered: null,
    };
  },

  componentWillMount() {
    this.simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide(radius))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .alphaMin(.45);
  },

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');

    this.svg = d3.select(this.refs.svg)
      .append('g')
      .attr('transform', (d) =>
        'translate(' + [this.props.size / 2, this.props.size / 2] + ')');

    var lighter = .25;
    var darker = .5;

    // add in trip name
    var fontSize = 14;
    this.svg.append('text')
      .attr('y', -fontSize - 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize - 2)
      .attr('dy', '.35em')
      .attr('fill', this.props.fontColor)
      .attr('opacity', darker)
      .text(this.props.year);
    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', this.props.fontColor)
      .attr('font-size', fontSize)
      .text(this.props.name);

    // add in company
    this.svg.append('g')
      .classed('company', true)
      .selectAll('path')
      .data(this.props.company)
      .enter().append('path')
      .attr('d', arc)
      .attr('opacity', (d) => d.person === 'Alex' ? darker * .8 : lighter)
      .attr('fill', (d) => d.person === 'Alex' ? red : this.props.fontColor);

    // add in places
    this.svg.append('g')
      .classed('places', true)
      .selectAll('path')
      .data(this.props.places)
      .enter().append('path')
      .attr('d', arc)
      .attr('opacity', darker)
      .attr('fill', this.props.fontColor);

    // loves
    this.svg.append('g')
      .classed('loves', true)
      .selectAll('circle')
      .data(this.props.loves)
      .enter().append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 3)
      .attr('fill', this.props.fontColor);

    // day markers
    this.svg.append('g')
      .classed('markers', true)
      .attr('fill', 'none')
      .attr('stroke', this.props.fontColor)
      .attr('opacity', lighter)
      .selectAll('line')
      .data(this.props.days)
      .enter().append('line')
      .attr('x1', (d) => d.x1)
      .attr('x2', (d) => d.x2)
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2);

    // hover
    var that = this;
    this.svg.append('g')
      .classed('days', true)
      .selectAll('path')
      .data(this.props.hovers)
      .enter().append('path')
      .attr('d', hoverArc)
      .attr('opacity', 0)
      .attr('fill', this.props.fontColor)
      .style('cursor', 'pointer')
      .on('mouseenter', function(d) {that.hover(this, d)})
      .on('mouseleave', function(d) {that.hover(this)});

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

  hover(el, d) {
    d3.select(el).attr('opacity', d ? .1 : 0);
    this.setState({hovered: d});
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
      pointerEvents: 'none',
    };
    var fontSize = 18;
    var annotationStyle = {
      textAlign: 'center',
      color: this.props.fontColor,
      height: fontSize * 5,
      fontSize,
      width: Math.max(this.props.size * .5, 200),
      margin: 'auto',
    };
    var headerStyle = {
      borderBottom: '1px solid',
      fontWeight: 600,
      margin: 5,
      padding: 5,
    };
    var subStyle = {
      fontSize: 14,
      margin: 5,
      opacity: .5,
    };

    var hovered = this.state.hovered;
    if (hovered) {
      var company = hovered.company.length ? 'with ' + hovered.company : '';
      if (hovered.company.length > 1) {
        company = 'with ' + _.initial(hovered.company).join(', ') +
          ' and ' + _.last(hovered.company);
      }
      hovered = (
        <div>
          <div style={headerStyle}>
            Day {hovered.index} ({dateFormat(hovered.day)})
          </div>
          <div style={subStyle}>
            in {hovered.place} {company}
          </div>
          <div style={subStyle}>
            {hovered.love}  💕
          </div>
        </div>
      );
    } else {
      hovered = (
        <div>
          <div style={subStyle}>
            {dateFormat(this.props.startDate)} to {dateFormat(this.props.endDate)}
          </div>
          <div style={subStyle}>✨</div>
        </div>
      );
    }

    return (
      <span style={style}>
        <canvas style={canvasStyle} ref='canvas'
          width={this.props.size} height={this.props.size}  />
        <svg ref='svg'
          width={this.props.size} height={this.props.size} />
        <div style={annotationStyle}>
          {hovered}
        </div>
      </span>
    );
  }
});

export default Trip;
