import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Trip from './Trip';
import photos from './data/more_colors.json';
import tripsData from './data/trips.json';

var backgroundColor = chroma('#273547').darken().hex();
var fontColor = chroma('#273547').brighten(4).hex();

var maxWidth = 400;
var startAngle = -.5 * Math.PI;
var endAngle = 1.5 * Math.PI;
var sizeScale = d3.scaleLinear().range([maxWidth / 2, maxWidth]);
var radiusScale = d3.scaleLinear().domain([0, 360]);
var angleScale = d3.scaleLinear().range([startAngle, endAngle]);
var family = ["Alex", "mom", "dad", "sister", "grandpa", "grandma", "aunt", "uncle", "cousin"];

var App = React.createClass({
  getInitialState() {
    return {
      fontColor,
      trips: [],
    };
  },

  componentWillMount() {
    var trips = _.chain(photos)
      .filter(photo => {
        photo.date = photo.date && new Date(photo.date);
        return photo.date;
      }).sortBy(photo => photo.date)
      .groupBy(photo => photo.tripId).value();
    var maxPhotos = _.chain(trips).values().maxBy((photos) => photos.length).value().length;
    var minPhotos = _.chain(trips).values().minBy((photos) => photos.length).value().length;
    sizeScale.domain([minPhotos, maxPhotos]);

    trips = _.map(trips, (photos, tripId) => {
      var trip = _.find(tripsData, trip => trip.id === tripId);
      var tripSize = sizeScale(photos.length);
      radiusScale.range([tripSize * .1, tripSize * .4]);

      // then get start and end dates of the trip
      var startDate = _.minBy(photos, photo => photo.date).date;
      var endDate = _.maxBy(photos, photo => photo.date).date;
      startDate = d3.timeDay.floor(startDate);
      endDate = d3.timeDay.ceil(endDate);
      angleScale.domain([startDate, endDate]);

      // calculate company arcs
      var company = this.calculateCompanyArcs(trip.company,
        tripSize * .45, d3.timeDay.count(startDate, endDate));
      var days = this.calculateDays(startDate, endDate, tripSize);

      var colors = _.chain(photos)
        .map((photo) => {
          var hour = d3.timeHour.floor(photo.date);
          var angle = angleScale(hour);

          return _.map(photo.colors, color => {
            if (chroma.contrast(backgroundColor, color) < 4.5) {
              // if contrast is low, up the saturation
              color = chroma(color).brighten(2).saturate(2);
            } else {
              color = chroma(color).saturate(2);
            }
            // if there's no hue, then don't show it
            if (!color.hsv()[0]) return;

            var hue = (color.hsv()[0] + 120) % 360;
            var radius = radiusScale(hue);
            var focusX = Math.cos(angle) * radius;
            var focusY = Math.sin(angle) * radius;

            return {
              id: photo.id,
              tripId,
              date: photo.date,
              focusX,
              focusY,
              geo: photo.geo,
              color: color.hex(),
            };
          });
        }).flatten().filter().value();

      return {
        colors,
        year: trip.year,
        name: trip.name,
        id: tripId,
        size: tripSize,
        company,
        days,
      }
    });

    this.setState({trips});
  },

  calculateDays(startDate, endDate, tripSize) {
    var days = d3.timeDay.range(startDate, endDate, 1);
    return _.map(days, (day, index) => {
      var angle = angleScale(day);
      return {
        index,
        day,
        angle,
        x1: Math.cos(angle) * (tripSize * .25),
        y1: Math.sin(angle) * (tripSize * .25),
        x2: Math.cos(angle) * (tripSize * .35),
        y2: Math.sin(angle) * (tripSize * .35),
      }
    });
  },

  calculateCompanyArcs(company, outerRadius, numDays) {
    var prevDay = null;
    var prevPeople = null;
    var prevAngle = 0;
    var perAngle = 2 * Math.PI / numDays;
    var arcPadding = 3;
    var familyPadding = 3;
    var friendsPadding = 1.5;
    var allArcs = _.map(company, (people, day) => {
      day = parseInt(day, 10);
      if (!day) { // if day is 0, it's the first one so set
        prevDay = day;
        prevPeople = people;
        return;
      }

      // calculate current angle
      var angle = prevAngle + (day - prevDay) * perAngle;
      var outer = outerRadius;
      var inner;
      var arcs = _.map(prevPeople, person => {
        inner = outer - (_.includes(family, person) ? familyPadding : friendsPadding);
        var arc = {
          outerRadius: outer,
          innerRadius: inner,
          startAngle: prevAngle,
          endAngle: angle,
          person,
        }
        outer = inner - arcPadding;
        return arc;
      });

      // now set prevDay and prevAngle to current day and angle
      prevDay = day;
      prevAngle = angle;
      prevPeople = people;

      return arcs;
    });

    // and put in the last arc
    // calculate current angle
    var outer = outerRadius;
    var inner;
    var arcs = _.map(prevPeople, person => {
      inner = outer - (_.includes(family, person) ? familyPadding : friendsPadding);
      var arc = {
        outerRadius: outer,
        innerRadius: inner,
        startAngle: prevAngle,
        endAngle: 2 * Math.PI,
        person,
      }
      outer = inner - arcPadding;
      return arc;
    });
    allArcs.push(arcs);
    return _.chain(allArcs).filter(arc => !_.isEmpty(arc)).flatten().value();
  },

  render() {
    var tripStyle = {fontColor: this.state.fontColor};
    var trips = _.chain(this.state.trips)
      .groupBy(trip => trip.year)
      .sortBy((trips, year) => -parseInt(year, 10))
      .map(trips => {
        var width = _.reduce(trips, (sum, trip) => sum + trip.size, 0);
        var style = {
          width,
          margin: 'auto',
        };
        var component = _.map(trips, trip => {
          return <Trip {...trip} {...tripStyle} />;
        });
        return (
          <div style={style}>
            {component}
          </div>
        );
      }).value();
    return (
      <div className="App">
        {trips}
      </div>
    );
  }
});

export default App;
