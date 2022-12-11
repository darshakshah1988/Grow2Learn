const fs = require('fs')
const handlebars = require('handlebars')

const layout = fs.readFileSync(`${__dirname}/views/mail/layouts/default.handlebars`, 'utf8')
const readFile = name => {
  const content = fs.readFileSync(`${__dirname}/views/mail/${name}`, 'utf8')
  return layout.replace('[[CONTENT]]', content)
}
const getTemplate = name => handlebars.compile(readFile(name))

const mail = {
  FROM: 'Grow2Learn <noreply@Grow2Learn.com.au>',
  TO: 'contact@Grow2Learn.com',
  welcome: {
    subject: name => `Grow2Learn registration`,
    text: getTemplate('welcome.txt'),
    html: getTemplate('welcome.handlebars'),
  },
  invite: {
    subject: `Grow2Learn invite`,
    text: getTemplate('invite.txt'),
    html: getTemplate('invite.handlebars'),
  },
  minvite: {
    subject: `Grow2Learn invite`,
    text: getTemplate('minvite.txt'),
    html: getTemplate('minvite.handlebars'),
  },
  resetPassword: {
    subject: `Grow2Learn reset password`,
    text: getTemplate('reset-password.txt'),
    html: getTemplate('reset-password.handlebars'),
  },
  downgrade: {
    subject: 'Downgrade Subscription Plan Request',
    text: getTemplate('downgrade-plan.txt'),
    html: getTemplate('downgrade-plan.handlebars')
  },
  subscribers: {
    subject: 'New Registration to Grow2Learn',
    text: getTemplate('subscribers.txt'),
    html: getTemplate('subscribers.handlebars')
  },
  registration: {
    text: getTemplate('registration2admin.txt'),
    html: getTemplate('registration2admin.handlebars')
  },
  inviteCourse: {
    text: getTemplate('inviteCourseUser.txt'),
    html: getTemplate('inviteCourseUser.handlebars')
  }
}

export default mail
