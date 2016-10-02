import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

var colorsWidth = 400;
var colorsHeight = 15;
var gradientScale = d3.scaleLinear().range([0, 1]);
var offsetScale = d3.scaleLinear().domain([5, 355]).range([0, 100]);
var Intro = React.createClass({
  componentDidMount() {
    this.colors = d3.select(this.refs.colors);
    this.renderColorGradient();

  },

  renderColorGradient() {
    var gradientColors = _.chain(this.props.trips)
      .map('colors').flatten()
      .groupBy(color => {
        var hue = chroma(color.color).hsl()[0];
        return _.ceil(hue, -1);
      }).value();
    var minColors = _.minBy(_.values(gradientColors), (colors) => colors.length).length;
    var maxColors = _.maxBy(_.values(gradientColors), (colors) => colors.length).length;
    gradientScale.domain([minColors, maxColors]);


    gradientColors = _.map(gradientColors, (colors, hue) => {
      hue = parseInt(hue, 10) - 5;
      var saturation = _.sumBy(colors, color => chroma(color.color).hsl()[1]);
      saturation = saturation / colors.length;
      var value = gradientScale(colors.length)
      return {
        offset: offsetScale((hue + 120) % 360),
        color: chroma(hue, 1, value, 'hsv').hex()
      };
    });

    var linearGradient = this.colors
      .append('defs').append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
      .data(gradientColors)
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset + '%'; })
      .attr("stop-color", function(d) { return d.color; });

    this.colors.append("rect")
    	.attr("width", colorsWidth)
    	.attr("height", colorsHeight)
    	.style("fill", "url(#linear-gradient)");
  },

  render() {
    var style = {
      textAlign: 'center',
    };
    return (
      <div className="Intro" style={style}>
        <svg ref='colors' width={colorsWidth} height={colorsHeight} />
      </div>
    );
  }
});

export default Intro;
