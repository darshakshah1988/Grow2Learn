// Dependencies
import * as path from 'path'
import * as express from 'express'
import * as exphbs from 'express-handlebars'
import * as passport from 'passport'
import * as epilogue from 'epilogue'
import * as bodyParser from 'body-parser'
import { SESSION_CONFIG, STRIPE_SECRET } from './constants'
import * as httpsRedirect from 'express-https-redirect'
import connection from './connection'

const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const stripe = require('stripe')(STRIPE_SECRET)

// Init Express Server
const app = express()

// View Engine
const hbs = exphbs.create({})

app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.engine('handlebars', hbs.engine)

// Middleware
import { cors } from './middleware'
import { checkAdminLogin, checkStudentLogin } from './authentication'
import { Logger } from './logger'
const staticRoute = express.static(path.resolve('./dist'))
app.use('/', httpsRedirect())

app.use(session({
  secret: SESSION_CONFIG.secret,
  store: new SequelizeStore({
    db: connection
  }),
  resave: false, // we support the touch method so per the express-session docs this should be set to false
  proxy: true // if you do SSL outside of node.
}))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-fileupload')())
app.use(passport.initialize())
app.use(passport.session())
app.use(cors)

app.use('/landing', express.static(path.resolve('./landing')))
app.use('/invite*', staticRoute)
app.use('/confirm*', staticRoute)
app.use('/mconfirm*', staticRoute)
app.use('/reset-password*', staticRoute)
app.use('/l/:userType', staticRoute)
app.use('/subscription-plans*', staticRoute)
// Student
app.use('/app', checkStudentLogin)
app.use('/app*', staticRoute)
// Admin
app.use('/dashboard', checkAdminLogin)
app.use('/dashboard', staticRoute)
app.use('/c/*', checkAdminLogin)
app.use('/c/*', staticRoute)
app.use('/s/*', checkAdminLogin)
app.use('/s/*', staticRoute)
app.use('/b/*', checkAdminLogin)
app.use('/b/*', staticRoute)

app.get('/', async (req, res) => {
  const subscription_plans = []
  let free_plan = null
  for await (const product of stripe.products.list({limit: 3})) {
    const keys = Object.keys(product.metadata)
    const features = keys.filter(k => k !== 'price' && k !== 'price_id').map(k => {
      return product.metadata[k]
    })
    product.price = product.metadata.price
    product.price_id = product.metadata.price_id
    product.features = features
    delete product.metadata
    
    if (product.name === 'Free Plan') {
      free_plan = product.price_id
    }
    subscription_plans.push(product)
  }
  res.render('index', {
    products: subscription_plans.reverse(),
    free_plan: free_plan
  })
})

app.use('/assets', express.static(path.resolve('./dist/assets')))
app.use('/static', staticRoute)
app.use(staticRoute)

epilogue.initialize({ app, sequelize: connection })

export default app
