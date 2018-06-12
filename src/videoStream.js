const WebSocket = require('ws')
const EventEmitter = require('events')
const STREAM_MAGIC_BYTES = "jsmp"
const Mpeg1Muxer = require('./mpeg1muxer')

class VideoStream extends EventEmitter {

  constructor(options) {
    super(options)
    this.name = options.name
    this.url = options.url
    this.width = options.width
    this.height = options.height
    this.port = options.port
    this.stream = void 0
    this.stream2Socket()
  }

  stream2Socket() {
    this.server = new WebSocket.Server({ port: this.port })
    this.server.on('connection', (socket) => {

      console.log(`New connection: ${this.name}`)

      let streamHeader = new Buffer(8)
      streamHeader.write(STREAM_MAGIC_BYTES)
      streamHeader.writeUInt16BE(this.width, 4)
      streamHeader.writeUInt16BE(this.height, 6)
      socket.send(streamHeader)

      socket.on('close', () => { console.log(`${this.name} disconnected !`) })
    })

    this.on('camdata', (data) => {
      for (let i in this.server.clients) {
        let client = this.server.clients[i]
        if(client.readyState === WebSocket.OPEN) { client.send(data) }
      }
    })
  }

  onSocketConnect(socket) {
    let streamHeader = new Buffer(8)
    streamHeader.write(STREAM_MAGIC_BYTES)
    streamHeader.writeUInt16BE(this.width, 4)
    streamHeader.writeUInt16BE(this.height, 6)
    socket.send(streamHeader, { binary: true })
    console.log(`New connection: ${this.name} - ${this.wsServer.clients.length} total`)
    return socket.on("close", function(code, message) {
      return console.log(`${this.name} disconnected - ${this.wsServer.clients.length} total`)
    })
  }

  start() {
    this.mpeg1Muxer = new Mpeg1Muxer({ url: this.url })
    this.mpeg1Muxer.on('mpeg1data', (data) => { return this.emit('camdata', data) })

    let gettingInputData = false
    let gettingOutputData = false
    let inputData = []
    let outputData = []

    this.mpeg1Muxer.on('ffmpegError', (data) => {
      data = data.toString()
      if (data.indexOf('Input #') !== -1) { gettingInputData = true }
      if (data.indexOf('Output #') !== -1) {
        gettingInputData = false
        gettingOutputData = true
      }
      if (data.indexOf('frame') === 0) { gettingOutputData = false }
      if (gettingInputData) {
        inputData.push(data.toString())
        let size = data.match(/\d+x\d+/)
        if (size != null) {
          size = size[0].split('x')
          if (this.width == null) { this.width = parseInt(size[0], 10) }
          if (this.height == null) { return this.height = parseInt(size[1], 10) }
        }
      }
    })
    this.mpeg1Muxer.on('ffmpegError', (data) => { return global.process.stderr.write(data) })
    return this
  }

  stop(serverCloseCallback) {
    this.server.close(serverCloseCallback)
    this.server.removeAllListeners()
    this.server = undefined

    this.mpeg1Muxer.stop()
    this.mpeg1Muxer.removeAllListeners()
    this.mpeg1Muxer = undefined
  }
}

module.exports = VideoStream
