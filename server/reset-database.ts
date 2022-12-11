require('dotenv').config()
import connection from './connection'

import { Business, Card, Course, Mentor, Student, Unit, Admin, BusinessStudent, BusinessCourse, CourseStudent, Activity, Notification } from './models'
import { createAdmin, createStudent, createMentor } from './actions'
import { hashPasswordSync } from './authentication'
import { STRIPE_SECRET } from './constants'
import { Logger } from './logger'

// Data
const admins = require('../data/admins.json')
const students = require('../data/students.json')
const cards = require('../data/cards.json')
const subscription_plans = require('../data/subscription_plans.json')

const stripe = require('stripe')(STRIPE_SECRET)

const done = () => {
  connection.close()
  console.log('Done')
}

const main = async () => {
  
  try {
    const limit = { limit: 100 }
    
    for await (const subscription of stripe.subscriptions.list(limit)) {
      const delSub = await stripe.subscriptions.del(subscription.id)
      if (delSub) {
        Logger.info(`Subscription with id ${delSub.id} has been cancelled`)
      }
    }
    for await (const customer of stripe.customers.list(limit)) {
      const delCustomer = await stripe.customers.del(customer.id)
      if (delCustomer.deleted) {
        Logger.info(`Customer with id ${delCustomer.id} has been deleted`)
      }
    }
    for await (const price of stripe.prices.list(limit)) {
      const delPrice = await stripe.plans.del(price.id)
      if (delPrice.deleted) {
        Logger.info(`Price with id ${delPrice.id} has been deleted`)
      }
    }
    for await (const product of stripe.products.list(limit)) {
      const delProduct = await stripe.products.del(product.id)
      if (delProduct.deleted) {
        Logger.info(`Product with id ${delProduct.id} has been deleted`)
      }
    }
    for (let i = 0 ; i < subscription_plans.length ; i++) {
      const sp = subscription_plans[i]
      const product = await stripe.products.create({
        name: sp.name,
        description: sp.description,
        metadata: {
        ...sp.features,
          price: sp.price
        }
      })
      Logger.info(`Product with id ${product.id} has been created`)
      const price = await stripe.prices.create({
        unit_amount: sp.price * 100,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        product: product.id,
      })
      Logger.info(`Price with id ${price.id} has been created`)
      const updateProduct = await stripe.products.update(product.id, {
        metadata: {
          ...product.metadata,
          price_id: price.id
        }
      })
      Logger.info(`Product with id ${updateProduct.id} has been updated`)
    }
  } catch (e) {
    console.error(e)
  }

  if (!process.env.SAMPLE_DATA) {
    // TODO: once admin registration exists, this can be removed
    const password = hashPasswordSync('password')
    const name = 'EZ Training'
    const admin = await Admin.create({
      id: 1,
      name,
      email: 'root@root',
      password,
    })
    await Business.create({
      name,
      adminId: admin.id
    })
    done()
    return
  }
  console.log('Loading sample data')
  await Promise.all([
    ...admins.map(admin => createAdmin(admin)),
    ...students.map(student => createStudent(student)),
  ])
  await Course.create({ name: 'Sports Turf Management', adminId: 1 })
  await Course.create({ name: 'Pool Maintenance', adminId: 2 })
  await Unit.create({ name: 'Grass Maintenance', courseId: 1, })
  await Unit.create({ name: 'Maintaining chemical balance in pools', courseId: 2, })
  await Business.create({ name: 'Green Options', adminId: 1 })
  await Business.create({ name: 'Perfection Plus', adminId: 2 })
  await Promise.all(cards.map(d => {
    d.quiz = JSON.stringify(d.quiz)
    return Card.create(d)
  }))
  await createMentor({ first_name: 'Buddha', businessId: 1, email: 'buddha@gmail.com', password: 'password' })
  await createMentor({ first_name: 'Jesus', businessId: 1, email: 'jesus@hotmail.com', password: 'password' })
  await BusinessStudent.create({ businessId: 1, studentId: 1, })
  await BusinessStudent.create({ businessId: 1, studentId: 2, })
  await BusinessStudent.create({ businessId: 2, studentId: 1, })
  await BusinessCourse.create({ businessId: 1, courseId: 1, })
  await CourseStudent.create({ courseId: 1, studentId: 1, assigned: Date.now() })
  await CourseStudent.create({ courseId: 1, studentId: 2, assigned: Date.now() })
  await CourseStudent.create({ courseId: 1, studentId: 3, assigned: Date.now() })
  await CourseStudent.create({ courseId: 2, studentId: 1, assigned: Date.now() })
  await Activity.create({ studentId: 1, cardId: 1, text: 'I mowed my leg', completed: false })
  await Activity.create({ studentId: 1, cardId: 1, text: 'I mowed a lawn', completed: true })
  await Activity.create({ studentId: 1, text: 'I started a course' })
  await Notification.create({ studentId: 1, message: 'Sample notification' })
  done()
}

const reset = async () => {
  await connection.sync({ force: true })
  await main()
}

if (process.argv.pop() === '-run') {
  if (process.env.CLEARDB_DATABASE_URL) {
    console.warn('WARNING! Refusing to run reset database when CLEARDB_DATABASE_URL is set. Are you sure you meant to do this?')
  } else {
    reset()
  }
} else {
  reset()
}

export default reset
