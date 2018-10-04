# node-rtsp-stream-es6

First of all, it's a fork of [**node-rtsp-stream**](https://www.npmjs.com/package/node-rtsp-stream)

## Differences with the original module

- Written in ES6 instead of CoffeeScript
- Github repository

## Description

Stream any RTSP stream and output to [WebSocket](https://github.com/websockets/ws) for consumption by [jsmpeg](https://github.com/phoboslab/jsmpeg).
HTML5 streaming video!

## Requirements

You need to download and install [FFMPEG](https://ffmpeg.org/download.html).

## Installation

```shell
npm i node-rtsp-stream-es6
```

## Server

```javascript
const Stream = require('videoStream')

const options = {
  name: 'streamName',
  url: 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov',
  port: 5000
}

stream = new Stream(options)

stream.start()
```


## Client

```javascript
const WebSocket = require('ws')
const ws = new WebSocket('ws://localhost:5000')

ws.on('open', () => {
  console.log('Connected to stream')
})

ws.on('message', (data, flags) => {
  console.log(data)
})
```

You can find a live stream JSMPEG example here : https://github.com/phoboslab/jsmpeg/blob/master/view-stream.html
