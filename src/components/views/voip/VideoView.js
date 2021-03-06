/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import sdk from '../../../index';
import dis from '../../../dispatcher';

import UserSettingsStore from '../../../UserSettingsStore';

module.exports = React.createClass({
    displayName: 'VideoView',

    propTypes: {
        // maxHeight style attribute for the video element
        maxHeight: React.PropTypes.number,

        // a callback which is called when the user clicks on the video div
        onClick: React.PropTypes.func,

        // a callback which is called when the video element is resized due to
        // a change in video metadata
        onResize: React.PropTypes.func,
    },

    componentDidMount: function() {
        this.dispatcherRef = dis.register(this.onAction);
    },

    componentWillUnmount: function() {
        dis.unregister(this.dispatcherRef);
    },

    getRemoteVideoElement: function() {
        return ReactDOM.findDOMNode(this.refs.remote);
    },

    getRemoteAudioElement: function() {
        // this needs to be somewhere at the top of the DOM which
        // always exists to avoid audio interruptions.
        // Might as well just use DOM.
        const remoteAudioElement = document.getElementById("remoteAudio");
        if (!remoteAudioElement) {
            console.error("Failed to find remoteAudio element - cannot play audio!"
                + "You need to add an <audio/> to the DOM.");
        }
        return remoteAudioElement;
    },

    getLocalVideoElement: function() {
        return ReactDOM.findDOMNode(this.refs.local);
    },

    setContainer: function(c) {
        this.container = c;
    },

    onAction: function(payload) {
        switch (payload.action) {
            case 'video_fullscreen': {
                if (!this.container) {
                    return;
                }
                const element = this.container;
                if (payload.fullscreen) {
                    const requestMethod = (
                        element.requestFullScreen ||
                        element.webkitRequestFullScreen ||
                        element.mozRequestFullScreen ||
                        element.msRequestFullscreen
                    );
                    requestMethod.call(element);
                } else {
                    const exitMethod = (
                        document.exitFullscreen ||
                        document.mozCancelFullScreen ||
                        document.webkitExitFullscreen ||
                        document.msExitFullscreen
                    );
                    if (exitMethod) {
                        exitMethod.call(document);
                    }
                }
                break;
            }
        }
    },

    render: function() {
        const VideoFeed = sdk.getComponent('voip.VideoFeed');

        // if we're fullscreen, we don't want to set a maxHeight on the video element.
        const fullscreenElement = (document.fullscreenElement ||
                 document.mozFullScreenElement ||
                 document.webkitFullscreenElement);
        const maxVideoHeight = fullscreenElement ? null : this.props.maxHeight;
        const localVideoFeedClasses = classNames("mx_VideoView_localVideoFeed",
            { "mx_VideoView_localVideoFeed_flipped":
                UserSettingsStore.getSyncedSetting('VideoView.flipVideoHorizontally', false),
            },
        );
        return (
            <div className="mx_VideoView" ref={this.setContainer} onClick={this.props.onClick}>
                <div className="mx_VideoView_remoteVideoFeed">
                    <VideoFeed ref="remote" onResize={this.props.onResize}
                        maxHeight={maxVideoHeight} />
                </div>
                <div className={localVideoFeedClasses}>
                    <VideoFeed ref="local" />
                </div>
            </div>
        );
    },
});
