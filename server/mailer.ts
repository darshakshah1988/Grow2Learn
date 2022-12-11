import * as mailgun from 'mailgun-js'

const fauxMailer = {
    messages: () => ({
        send: (details, cb) => {
            // console.log(details)
            cb(null, details)
        }
    })
}

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env
const mailer = MAILGUN_API_KEY ? mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
}) : fauxMailer

export default mailer
