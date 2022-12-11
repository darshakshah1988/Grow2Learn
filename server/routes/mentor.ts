import app from '../app'

import { checkMentorLogin, authMentor } from '../authentication'

app.get('/mentor', checkMentorLogin, (req, res) => {
  res.send('Authed as mentor')
})

app.get('/mentor/login', (req, res) => {
  res.render('login')
})

app.post('/mentor/login', authMentor, (req, res) => {
  res.redirect('/mentor')
})
