const fs = require('fs')
const s = require('streamifier')
const { google } = require('googleapis')
const service = google.youtube('v3')
const readline = require('readline')
const OAuth2 = google.auth.OAuth2
import { Logger } from './logger'
import { File } from './models'

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/upload_app_session.json
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
]
const TOKEN_DIR =
    (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
    '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'upload_app_session.json'

export const authorize = (credentials, cb, data) => {
    const clientSecret = credentials.web.client_secret
    const clientId = credentials.web.client_id
    const redirectUrl = credentials.web.redirect_uris[0]
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl)
    
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (error, token) => {
        if (error) {
            return getNewToken(oauth2Client, cb, data)
        } else {
            oauth2Client.credentials = JSON.parse(token)
            return cb(oauth2Client, data)
        }
    })
}

const getNewToken = (oauth2Client, cb, data) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })
    console.log('Authorize this app by visiting this url: ', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.question('Enter the code from that page here: ', code => {
        rl.close()
        oauth2Client.getToken(code, (error, token) => {
            if (error) {
                console.log('Error while trying to retrieve access token', error)
                return
            }
            oauth2Client.credentials = token
            storeToken(token)
            return cb(oauth2Client, data)
        })
    })
}

const storeToken = token => {
    try {
        fs.mkdirSync(TOKEN_DIR)
    } catch (error) {
        if (error.code != 'EEXIST') {
            throw error
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), error => {
        if (error) throw error
        console.log('Token stored to ' + TOKEN_PATH)
    })
}

export const uploadVideo = (auth, { name, file, res, card, size }) => {
    service.videos.insert({
        auth: auth,
        part: 'snippet,contentDetails,status',
        resource: {
            // Video title and description
            snippet: {
                title: name,
                description: name
            },
            // I set to private for tests
            status: {
                privacyStatus: 'unlisted'
            }
        },
        // Create the readable stream to upload the video
        media: {                
            body: s.createReadStream(file.data) // Change here to your real video
        }
    }, (error, response) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return
        }
        File.create({
            type: 'youtube',
            size: size,
            name: response.data.id
        }).then(file => {
            card.videoId = file.id
            card.save()
            Logger.debug('Successfully uploaded video to Youtube with embed url https://www.youtube.com/embed/' + response.data.id)
            res.send({
                id: response.data.id
            })
        })
    })
}

export const updateVideo = (auth, { id, name, res }) => {
    service.videos.update({
        auth: auth,
        id: id,
        part: 'snippet,contentDetails,status',
        resource: {
            // Video title and description
            snippet: {
                title: name,
                description: name
            },
            // I set to private for tests
            status: {
                privacyStatus: 'private'
            }
        }
    }, (error, response) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return
        }
        res.send('Updated')
    })
}

export const removeVideo = (auth, { card, res }) => {
    File.findByPk(card.videoId).then(file => {
        service.videos.delete({
            auth: auth,
            id: file.name
        }, (error, response) => {
            if (error) {
                console.log('The API returned an error: ' + error)
                return
            }
            Logger.debug('Successfully deleted video from Youtube with embed url https://www.youtube.com/embed/' + card.videoId)
            card.videoId = null
            card.save()
            file.destroy()
            res.send('OK')
        })
    })
}