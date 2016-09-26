import React from 'react';
import _ from 'lodash';

var Canvas = React.createClass({
  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.drawImages();
  },

  drawImages() {
    var imageSize = 8;
    var perRow = 50;
    _.chain(this.props.trips)
      .flatten()
      .each((photo, i) => {
        var img = new Image();
        img.onload = () => {
          var x = (i % perRow) * imageSize;
          var y = Math.floor(i / perRow) * imageSize;
          this.ctx.drawImage(img, x, y, imageSize, imageSize);
        };
        img.src = photo.image;
      }).value();
  },

  render() {
    return (
      <canvas width={this.props.width} height={this.props.height} ref='canvas' />
    );
  }
});

export default Canvas;
