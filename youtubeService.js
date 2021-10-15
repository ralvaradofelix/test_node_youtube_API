import { google } from "googleapis"
import util from "util"
import fs from "fs"

const writeFilePromise = util.promisify(fs.writeFile)
const readFilePromise = util.promisify(fs.readFile)

let liveChatId;
let nextPage;
const intervalTime = 5000;
let interval;
let chatMessages = [];

const save = async (path, data) => {
  await writeFilePromise(path, data);
  console.log('Succesfully Saved')
}

const read = async path => {
  const fileContents = await readFilePromise(path);
  return JSON.parse(fileContents)
}

const youtube = google.youtube('v3')

const Oauth2 = google.auth.OAuth2;

const clientId = "1079953934337-bgsv9pd0hle3dcarm758cmc3bdhnfd14.apps.googleusercontent.com"
const clientSecret = "UkylO7AM-bjmGADFgx7TgrI9"
const redirectURI = "http://localhost:5000/callback";

const scope = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl'
]

const auth = new Oauth2(clientId, clientSecret, redirectURI)

const youtubeService = {};

youtubeService.getCode = response => {
  const authUrl = auth.generateAuthUrl({
    acces_type: 'offline',
    scope: scope
  })
  response.redirect(authUrl)
}


youtubeService.getTokensWithCode = async code => {
  const credentials = await auth.getToken(code)
  youtubeService.authorize(credentials)
}

youtubeService.authorize = ({ tokens }) => {
  auth.setCredentials(tokens)
  console.log("Succesfully set credentials")
  console.log("tokens", tokens)
  save('./tokens.json', JSON.stringify(tokens))
}

auth.on('tokens', tokens => {
  console.log("new tokens received")
  save('./tokens.json', JSON.stringify(tokens))
})

const checkTokens = async () => {
  const tokens = await read('./tokens.json');
  if (tokens) {
    console.log('setting tokens')
    return auth.setCredentials(tokens)
  }
  console.log("no tokens found")
}

youtubeService.findActiveChat = async () => {
  const response = await youtube.liveBroadcasts.list({
    auth,
    part: 'snippet',
    broadcastStatus: 'active'
  })
  const latestsChat = response.data.items[0]
  console.log(response)
  if (latestsChat) {
    liveChatId = latestsChat.snippet.liveChatId
    console.log("Chat Id Found", liveChatId)
  }
}

const getChatMessages = async () => {
  const response = await youtube.liveChatMessages.list({
    auth,
    part: 'snippet',
    liveChatId,
    pageToken: nextPage
  })
  const { data } = response;
  const newMessages = data.items
  chatMessages.push(...newMessages)
  nextPage = data.nextPageToken;
  console.log('Total Chat Messages:', chatMessages.length)
  console.log(chatMessages)
}

youtubeService.startTrackingChat = async () => {
  interval = setInterval(getChatMessages, intervalTime);
}

youtubeService.displayMessages = async () => {
  console.log(chatMessages)
}

youtubeService.test = async () => {
  console.log("prueba")
}

checkTokens()

module.exports = youtubeService;