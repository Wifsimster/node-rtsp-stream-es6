const io = require('socket.io')()
const EventEmitter = require('events')
const STREAM_MAGIC_BYTES = "jsmp"

Mpeg1Muxer = require('./mpeg1muxer')

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
    io.on('connection', (socket) => { 
      //      this.onSocketConnect(socket) 

      console.log(`New connection: ${this.name}`)

      let streamHeader = new Buffer(8)
      streamHeader.write(STREAM_MAGIC_BYTES)
      streamHeader.writeUInt16BE(this.width, 4)
      streamHeader.writeUInt16BE(this.height, 6)
      socket.broadcast.emit('stream', streamHeader)

      this.on('camdata', (data) => { socket.broadcast.emit('stream', data) })     

      socket.on('disconnect', () => { console.log(`${this.name} disconnected !`) })

    })

    io.listen(this.port)

    //    io.broadcast = (data, opts) => {
    //      let results = []
    //      for (var i in this.clients) {
    //        if (this.clients[i].readyState === 1) {
    //          results.push(this.clients[i].send(data, opts))
    //        } else {
    //          results.push(console.log(`Error: Client (${i}) not connected`))
    //        }
    //      }
    //      return results
    //    }

    //    return this.on('camdata', (data) => { return this.wsServer.broadcast(data) })
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
    this.mpeg1Muxer.on('mpeg1data', (data) => {
      return this.emit('camdata', data) 
    })
    let gettingInputData = false
    let inputData = []
    let gettingOutputData = false
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
          if (this.width == null) {
            this.width = parseInt(size[0], 10)
          }
          if (this.height == null) {
            return this.height = parseInt(size[1], 10)
          }
        }
      }
    })
    this.mpeg1Muxer.on('ffmpegError', (data) => {
      return global.process.stderr.write(data)
    })
    return this
  }
}

module.exports = VideoStream
