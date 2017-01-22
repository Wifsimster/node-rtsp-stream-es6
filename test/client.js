const WebSocket = require('ws')
const ws = new WebSocket('ws://localhost:5000')

ws.on('open', () => {
  console.log('Connected to stream')
})

ws.on('message', (data, flags) => {
  console.log(data)
})