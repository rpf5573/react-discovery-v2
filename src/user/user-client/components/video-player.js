import React, { Component, Fragment } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.changeVideoSrc = this.changeVideoSrc.bind(this);
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

  changeVideoSrc(src) {
    if ( this.player ) {
      console.log( 'this.props.sources : ', src );
      this.player.src(src);
    }
  }

  componentWillReceiveProps() {
    console.log( 'this.props in componentWillReceiveProps: ', this.props );
  }

  render() {

    if ( ! this.props.isUploading && this.player ) {
      console.log( 'render and player src gogo', ' is called' );
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
