"use strict";
// hls

var HIGH_Q = window.location.toString().indexOf('high') > -1

const mSeedPeer = HIGH_Q ? "/browser-server/master.m3u8" : "/browser-server/index_800_av-p.m3u8";
const hqDR2 = "https://drevent-lh.akamaihd.net/i/event12_0@427365/master.m3u8";
const DR2 = "https://dr02-lh.akamaihd.net/i/dr02_0@147055/master.m3u8"

// poster
const poster = "http://www.dr.dk/mu-online/api/1.3/bar/52d3f5e66187a2077cbac70e?width=322&height=181";

var containerElement = document.getElementById("playerHandle");

// Build the standard video element
var playerElement = document.createElement("video");

playerElement.setAttribute("height", "480");
playerElement.setAttribute("width", "640");
playerElement.setAttribute("id", "videojs_player");
playerElement.setAttribute("class", "video-js vjs-default-skin vjs-big-play-centered poc-player");
playerElement.setAttribute("controls", "");
playerElement.setAttribute("poster", poster);

//build src element
var source = document.createElement("source");
source.setAttribute("src", DR2);
source.setAttribute("type", "application/x-mpegURL");

// append source to player
playerElement.appendChild(source);

// append video element to html handle.
containerElement.appendChild(playerElement);

// Initialize videojs on video-element id
var player = videojs('videojs_player', {
  "nativeControlsForTouch": false
});

// var vjsButton = videojs.getComponent('button');
var Button = videojs.getComponent('Button');

// Subclass the component (see 'extend' doc for more info)
// list of components to extend http://docs.videojs.com/docs/guides/components.html
var hqBtn = videojs.extend(Button, {
  constructor: function () {
    Button.apply(this, arguments);
    this.isHQ = false;
    /* initialize your button */
    // Add component specific styling
    this.addClass("hq-btn");
    this.el().innerHTML = "HQ";
  },
  handleClick: function () {
    /* do something on click */
    console.log("enable hq", !this.isHQ);
    if (this.isHQ) {
      this.removeClass("active");
      this.isHQ = false;
      player.src({ type: 'application/x-mpegURL', src: DR2 });
      player.play();
    } else {
      this.addClass("active");
      this.isHQ = true;
      player.src({ type: 'application/x-mpegURL', src: mSeedPeer });
      player.play()
    }

  }
});

// Register the new component with videojs
Button.registerComponent('hqBtn', hqBtn);

// Add the bingmenu component to the player
player.getChild('controlBar').addChild('hqBtn');

var totalConnections = document.getElementById("total-connections");
var connectionsList = document.getElementById("connections-list");

function updateTotal(connections, down, up) {
  console.log("set innerhtml", connections);
  var totalConn = '<div class="list-data"> | Total Connections: ' + connections + '</div>'
  var down = '<div class="list-data"> | down ' + down + "/s </div>";
  var up = '<div class="list-data"> | up ' + up + "/s </div>";
  totalConnections.innerHTML = totalConn + down + up;
}

function addToConnectionList(connection) {
  var connectionId = connection.id ? connection.id : "unnamed";
  var connectionUp = connection.upload ? connection.upload : "? kbs";
  var connectionDown = connection.download ? connection.download : "? kbs";

  var up = '<div class="list-data"> | up: ' + connectionUp + '</div>';
  var down = '<div class="list-data"> | down: ' + connectionDown + '</div>';
  var name = '<div class="list-data"> | name: ' + connectionId + '</div>';

  var template = name + down + up;

  var listElement = document.createElement('li');
  listElement.innerHTML = template;
  connectionsList.appendChild(listElement);

  return listElement;
}
function updateMonitor(connections) {
  connectionsList.innerHTML = '';
  connections.forEach(function (connection) {
    addToConnectionList(connection);
  });
}
var prettierBytes = require('prettier-bytes');
// global update state
setInterval(function () {
  if (window.p2pArchive && window.p2pArchive.content) {
    updateTotal(window.p2pArchive.content.peers.length, prettierBytes(window.totalConnections.downSpeed()), prettierBytes(window.totalConnections.upSpeed()));
  }
  console.log("peers", window.peers);

  // reset html
  connectionsList.innerHTML ="";
  if (window.peers) {
    Object.keys(window.peers).map(function (objectKey, index) {
      var value = window.peers[objectKey];
      // if element already exists
      addToConnectionList({ "id": value.id.substring(0, 6), "upload": prettierBytes(value.upSpeed()) + "/s", "download": prettierBytes(value.downSpeed()) + "/s" });
    });
  }
}, 2000);
