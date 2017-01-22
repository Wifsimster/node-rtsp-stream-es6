const server = require('http').createServer()
const ioc = require('socket.io-client')
const port = 5000

var srv = server.listen(() => {
  
  console.log(`Connecting to http://localhost:${port}...`)
  
  var socket = ioc('http://localhost:' + port)
  
  socket.on('connect', () => {
    console.log('Connected !')
  })
  
})