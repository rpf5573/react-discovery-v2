import React, { Component, Fragment } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';


export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  render() {
    console.log( 'render in video-player', ' is called' );
    if ( this.player && this.props.sources) {
      console.log( 'this.props.sources : ', this.props.sources );
      this.player.src(this.props.sources);
    }
    return (
      <div className="videoPlayer">
        <div data-vjs-player>
          <video ref={ node => this.videoNode = node } className="video-js"></video>
        </div>
      </div>
    );
  }
}
