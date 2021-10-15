import express from "express";
import path from "path"
const app = express();
var cors = require('cors')
const youtubeService = require('./youtubeService')

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Socket.io
io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('messages_list', list => {
    console.log("lista: ", list)
  })
})
// End Socket.io

app.use(cors())

app.get('/', (req, res) => 
  res.sendFile(path.join(__dirname, 'index.html'))
)

app.get('/live_chat', (req, res) => {
  res.sendFile(path.join(__dirname + "/views/", 'live_chat.html'))
})

app.get('/auth', (req, res) => {
  youtubeService.getCode(res)
})

app.get('/callback', (req, res) => {
  const { code } = req.query;
  youtubeService.getTokensWithCode(code)
  res.redirect('/')
})

app.get('/find-active-chat', (req, res) => {
  youtubeService.findActiveChat();
  // res.send("find active chat")
  res.redirect('/')
})

app.get('/start-tracking-chat', (req, res) => {
  youtubeService.startTrackingChat();
  // res.send("tracking chat")
  res.redirect('/')
})

app.get('/display-messages', (req, res) => {
  youtubeService.displayMessages()
  res.redirect('/')
})

app.listen(5000, () => {
 console.log("Server running on port 5000");
});