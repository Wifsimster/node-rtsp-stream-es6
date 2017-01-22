const Stream = require('../src/videoStream')

const options = {
  name: 'streamName',
  url: 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov',
  port: 5000
}

stream = new Stream(options)

stream.start()