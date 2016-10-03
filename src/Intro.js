import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';
var Remarkable = require('remarkable');
var md = new Remarkable({linkTarget: '_new', html: true});

var colorsWidth = 350;
var colorsHeight = 10;
var red = '#E94E77';
var gradientScale = d3.scaleLinear().range([0, 1]);
var offsetScale = d3.scaleLinear().domain([5, 355]).range([0, 100]);
var arc = d3.arc()
  .padAngle(.05)
  .cornerRadius(3);

var Intro = React.createClass({
  componentDidMount() {
    this.colors = d3.select(this.refs.colors);
    this.renderColorGradient();
    this.renderLegend();

  },

  renderIntro() {
    return `
Ever since graduating college, I've made it a goal to travel abroad at least once a year.  Over the years, I've accumulated almost 4000 images over the course of 13 trips.

I've taken those pictures and extracted the five primary colors from each, for a total of roughly 20,000 colors.  Most of the colors are green and blue - unsurprising, since I love taking photos of scenary (a sunny blue sky never fails to make me happy).  But I was quite confused about the abundance of reds and oranges; there was no way I was taking pictures of that many sunsets, and I have very rarely made it out of bed for a sunrise.  And that was when I realized - those were all pictures of food!

So for better or for worse, these colors perfectly represent how I travel: surround myself with nature (that fresh air!), and then explore the city for good food.  Repeat.
    `;
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
      // var saturation = _.sumBy(colors, color => chroma(color.color).hsl()[1]);
      // saturation = saturation / colors.length;
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

  renderLegend() {
    var maxWidth = 400;
    var fontSize = 12;
    var outerRadius = maxWidth * this.props.placesRadius - 3 * fontSize;
    var innerRadius = outerRadius - this.props.placePadding;
    var startAngle = -0.15 * Math.PI;
    var endAngle = 0.15 * Math.PI;
    var darker = .5;
    var lighter = .25;

    this.legend = d3.select(this.refs.legend)
      .append('g').attr('transform', 'translate(' + [maxWidth * .2, maxWidth / 2] + ')');
    this.legendText = d3.select(this.refs.legend)
      .append('g')
      // .attr('opacity', darker)
      .attr('transform', 'translate(' + [maxWidth * .65, maxWidth / 2] + ')');

    // places
    var arcData = {
      outerRadius,
      innerRadius,
      startAngle, endAngle,
    };
    this.legend.append('path')
      .datum(arcData)
      .attr('d', arc)
      .attr('opacity', darker)
      .attr('fill', this.props.fontColor);
    this.legendText.append('text')
      .attr('y', -innerRadius + fontSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.props.fontColor)
      .style('font-size', fontSize)
      .text('Stayed in the same place');

    // loves
    var y = maxWidth * this.props.lovesRadius - 2 * fontSize;
    this.legend.append('circle')
      .attr('cy', -y)
      .attr('r', 3)
      .attr('fill', this.props.fontColor);
    this.legendText.append('text')
      .attr('y', -y + fontSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.props.fontColor)
      .style('font-size', fontSize)
      .text('Loved something about the day');

    // company: Alex
    innerRadius = maxWidth * this.props.companyRadius - fontSize;
    outerRadius = innerRadius + this.props.familyPadding;
    arcData = {
      outerRadius,
      innerRadius,
      startAngle, endAngle,
    };
    this.legend.append('path')
      .datum(arcData)
      .attr('d', arc)
      .attr('opacity', darker)
      .attr('fill', red);
    this.legendText.append('text')
      .attr('y', -innerRadius + fontSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.props.fontColor)
      .style('font-size', fontSize)
      .text('Traveled with Alex 💖');

    // company: family
    innerRadius = outerRadius + this.props.arcPadding + fontSize;
    outerRadius = innerRadius + this.props.familyPadding;
    arcData = {
      outerRadius,
      innerRadius,
      startAngle, endAngle,
    };
    this.legend.append('path')
      .datum(arcData)
      .attr('d', arc)
      .attr('opacity', lighter)
      .attr('fill', this.props.fontColor);
    this.legendText.append('text')
      .attr('y', -innerRadius + fontSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.props.fontColor)
      .style('font-size', fontSize)
      .text('Traveled with/visited family');

    innerRadius = outerRadius + this.props.arcPadding + fontSize;
    outerRadius = innerRadius + this.props.friendsPadding;
    arcData = {
      outerRadius,
      innerRadius,
      startAngle, endAngle,
    };
    this.legend.append('path')
      .datum(arcData)
      .attr('d', arc)
      .attr('opacity', lighter)
      .attr('fill', this.props.fontColor);
    this.legendText.append('text')
      .attr('y', -innerRadius + fontSize / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.props.fontColor)
      .style('font-size', fontSize)
      .text('Traveled with/visited friends');
  },

  render() {
    var style = {
      textAlign: 'center',
      marginBottom: 120,
    };
    var introStyle = {
      maxWidth: 600,
      margin: 'auto',
      padding: 20,
      fontSize: 14,
    };
    var rawMarkup = { __html: md.render(this.renderIntro())};
    return (
      <div className="Intro" style={style}>
        <div style={introStyle} dangerouslySetInnerHTML={rawMarkup} />
        <svg ref='colors' style={{margin: '20px 0'}}
          width={colorsWidth} height={colorsHeight} />
        <h2>how to read the rings*</h2>
        <svg ref='legend' width={colorsWidth} /><br />
        <em style={introStyle}>*hover over the arcs for more details</em>
      </div>
    );
  }
});

export default Intro;
