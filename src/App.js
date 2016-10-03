import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import chroma from 'chroma-js';

import Intro from './Intro';
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
var family = ["Alex", "Mom", "Dad", "Sister", "Grandpa", "Grandma", "Aunt(s)", "Uncle(s)", "Cousin(s)"];

var App = React.createClass({
  getInitialState() {
    return {
      fontColor,
      trips: [],
      placesRadius: .35,
      lovesRadius: .365,
      companyRadius: .38,
      placePadding: 3,
      familyPadding: 4,
      friendsPadding: 2,
      arcPadding: 1.5,
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
      var innerRadius = tripSize * .08;
      radiusScale.range([innerRadius, tripSize * .31]);

      // then get start and end dates of the trip
      var startDate = _.minBy(photos, photo => photo.date).date;
      var endDate = _.maxBy(photos, photo => photo.date).date;
      startDate = d3.timeDay.floor(startDate);
      endDate = d3.timeDay.ceil(endDate);
      angleScale.domain([startDate, endDate]);

      // calculate company arcs
      var numDays = d3.timeDay.count(startDate, endDate);
      var places = this.calculatePlaces(trip.places, tripSize * this.state.placesRadius, numDays);
      var loves = this.calculateLoves(trip.loves, tripSize * this.state.lovesRadius, numDays);
      var company = this.calculateCompany(trip.company, tripSize * this.state.companyRadius, numDays);
      var days = d3.timeDay.range(startDate, endDate, 1);
      var hovers = this.calculateHovers(days, trip, innerRadius, tripSize * .5);
      days = this.calculateDays(days, tripSize);

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
        days,
        company,
        places,
        loves,
        hovers,
        startDate,
        endDate: d3.timeDay.offset(endDate, -1),
      }
    });

    this.setState({trips});
  },

  calculateDays(days, tripSize) {
    var inner = tripSize * .15;
    var outer = tripSize * .25;
    return _.map(days, (day, index) => {
      var angle = angleScale(day);
      return {
        x1: Math.cos(angle) * inner,
        y1: Math.sin(angle) * inner,
        x2: Math.cos(angle) * outer,
        y2: Math.sin(angle) * outer,
      }
    });
  },

  calculateHovers(days, trip, innerRadius, outerRadius) {
    var companyKeys = _.keys(trip.company);
    var placeKeys = _.keys(trip.places);
    var companyDay = companyKeys.shift();
    var placeDay = placeKeys.shift();

    return _.map(days, (day, index) => {
      // if this index is the same as the next
      // then shift the next out, because we want to be using that
      if (index === parseInt(companyKeys[0], 10)) {
        companyDay = companyKeys.shift();
      }
      if (index === parseInt(placeKeys[0], 10)) {
        placeDay = placeKeys.shift();
      }
      var company = trip.company[companyDay];
      var place = trip.places[placeDay];
      var love = trip.loves[index];
      var start = angleScale(day) - startAngle;
      var end = angleScale(d3.timeDay.offset(day)) - startAngle; // next day

      return {
        innerRadius,
        outerRadius,
        startAngle: start,
        endAngle: end,
        index: index + 1,
        day, company, place, love
      }
    });
  },

  calculateLoves(loves, radius, numDays) {
    var perAngle = 2 * Math.PI / numDays;
    return _.map(loves, (love, day) => {
      day = parseInt(day, 10);
      var angle = (day + .5) * perAngle + startAngle;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        love,
      }
    });
  },

  calculatePlaces(places, outerRadius, numDays) {
    var prevDay = null;
    var prevPlace = null;
    var prevAngle = 0;
    var perAngle = 2 * Math.PI / numDays;
    var innerRadius = outerRadius - this.state.placePadding;
    var arcs = _.map(places, (place, day) => {
      day = parseInt(day, 10);
      if (!day) { // if day is 0, it's the first one so set
        prevDay = day;
        prevPlace = place;
        return;
      }

      var angle = prevAngle + (day - prevDay) * perAngle;
      var arc = {
        outerRadius,
        innerRadius,
        startAngle: prevAngle,
        endAngle: angle,
        place: prevPlace,
      }

      prevDay = day;
      prevAngle = angle;
      prevPlace = place;

      return arc;
    });

    arcs.push({
      outerRadius,
      innerRadius,
      startAngle: prevAngle,
      endAngle: 2 * Math.PI,
      place: prevPlace,
    });

    return _.filter(arcs, arc => !_.isEmpty(arc));
  },

  calculateCompany(company, innerRadius, numDays) {
    var prevDay = null;
    var prevPeople = null;
    var prevAngle = 0;
    var perAngle = 2 * Math.PI / numDays;
    var allArcs = _.map(company, (people, day) => {
      day = parseInt(day, 10);
      if (!day) { // if day is 0, it's the first one so set
        prevDay = day;
        prevPeople = people;
        return;
      }

      // calculate current angle
      var angle = prevAngle + (day - prevDay) * perAngle;
      var outer;
      var inner = innerRadius;
      var arcs = _.map(prevPeople, person => {
        outer = inner + (_.includes(family, person) ?
        this.state.familyPadding : this.state.friendsPadding);
        var arc = {
          outerRadius: outer,
          innerRadius: inner,
          startAngle: prevAngle,
          endAngle: angle,
          person,
        }
        inner = outer + this.state.arcPadding;
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
    var outer;
    var inner = innerRadius;
    var arcs = _.map(prevPeople, person => {
      outer = inner + (_.includes(family, person) ?
      this.state.familyPadding : this.state.friendsPadding);
      var arc = {
        outerRadius: outer,
        innerRadius: inner,
        startAngle: prevAngle,
        endAngle: 2 * Math.PI,
        person,
      }
      inner = outer + this.state.arcPadding;
      return arc;
    });
    allArcs.push(arcs);
    return _.chain(allArcs).filter(arc => !_.isEmpty(arc)).flatten().value();
  },

  render() {
    var style = {
      textAlign: 'center',
    };
    var headerStyle = {
      fontSize: 42,
    };
    var footerStyle = {
      margin: '100px auto 40px auto',
    };
    var tripStyle = {fontColor};
    var trips = _.chain(this.state.trips)
      .groupBy(trip => trip.year)
      // .sortBy((trips, year) => -parseInt(year, 10))
      .map(trips => {
        var style = {
          margin: 'auto',
        };
        if (window.innerWidth > 800) {
          style.width = _.reduce(trips, (sum, trip) => sum + trip.size, 0);
        }
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
      <div className="App" style={style}>
        <h1 style={headerStyle}>
          Four Years of Vacations<br />
          in 20,000 Colors<br />
        </h1>
        <a href='https://twitter.com/sxywu' target='_new'>Shirley Wu</a>
        <Intro {...this.state} {...tripStyle}/>
        {trips}
        <div style={footerStyle}>
          made with 💖 for <a href='http://www.datasketch.es/september/' target='_new'>September</a>: <a href='http://www.datasketch.es/' target='_new'>datasketch|es</a><br />
          a monthly collaboration between <a href='https://twitter.com/nadiehbremer' target='_new'>Nadieh Bremer</a> and <a href='https://twitter.com/sxywu' target='_new'>Shirley Wu</a>
        </div>
      </div>
    );
  }
});

export default App;
