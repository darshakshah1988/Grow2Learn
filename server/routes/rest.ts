import * as epilogue from 'epilogue'

import { authEpilogue } from '../authentication'

import { Admin, Activity, Card, Course, Student, Unit, Business, BusinessCourse, Notification, File } from '../models'
import { Logger } from '../logger'

const authRest = (authorize) => (req, res, context) => {
  return new Promise((resolve, reject) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user.admin) {
      res.status(401).send({ message: 'Unauthorized' })
      resolve(context.stop)
    } else {
      authorize(req, res, context, resolve)
    }
  })
}

const createRestApi = (model, k, authorize) => {
  const resource = epilogue.resource({
    model,
    endpoints: [
      `/api/${k}/:id`
    ]
  })
  resource.all.auth(authRest(authorize))
  Logger.info('Exposing secure REST API: ' + k)
}

createRestApi(Business, 'business', (req, res, context, resolve) => {
  const id = parseInt(req.params.id)
  const adminId = req.user.admin.id
  if (req.body.adminId) {
    res.status(401).send({ message: 'Unauthorized: Business can not change Admin' })
    resolve(context.stop)
    return
  }
  Admin.findByPk(adminId, { include: [Business] }).then(admin => {
    const ids = admin.businesses.map(d => d.id)
    if (ids.indexOf(id) >= 0) {
      resolve(context.continue)
    } else {
      res.status(401).send({ message: 'Unauthorized: Admin does not own Business #' + id })
      resolve(context.stop)
    }
  })
})

createRestApi(Course, 'course', (req, res, context, resolve) => {
  const id = parseInt(req.params.id)
  const adminId = req.user.admin.id
  if (req.body.adminId) {
    res.status(401).send({ message: 'Unauthorized: Course can not change Admin' })
    resolve(context.stop)
    return
  }
  Admin.findByPk(adminId, { include: [Course] }).then(admin => {
    const ids = admin.courses.map(d => d.id)
    if (ids.indexOf(id) >= 0) {
      resolve(context.continue)
    } else {
      res.status(401).send({ message: 'Unauthorized: Admin does not own Course #' + id })
      resolve(context.stop)
    }
  })
})

createRestApi(Unit, 'unit', (req, res, context, resolve) => {
  const id = parseInt(req.params.id)
  const adminId = req.user.admin.id
  const { courseId } = req.body
  Admin.findByPk(adminId, { include: [{ model: Course, include: [Unit] }] })
    .then(admin => {
      if (courseId) {
        if (!admin.ownsCourse(courseId)) {
          res.status(401).send({ message: 'Unauthorized: Admin does not own Course #' + courseId })
          resolve(context.stop)
          return
        }
      }
      if (admin.ownsUnit(id)) {
        resolve(context.continue)
      } else {
        res.status(401).send({ message: 'Unauthorized: Admin does not own Unit #' + id })
        resolve(context.stop)
      }
    })
})

createRestApi(Card, 'card', (req, res, context, resolve) => {
  const id = parseInt(req.params.id)
  const adminId = req.user.admin.id
  delete req.body.unitId // Do not allow cards to change units
  Card.findByPk(id, { include: [{ model: Unit, include: [Course] }] }).then(card => {
    if (card && card.unit.course.adminId === adminId) {
      resolve(context.continue)
    } else {
      res.status(401).send({ message: 'Unauthorized: Admin does not own Card #' + id })
      resolve(context.stop)
    }
  })
})

createRestApi(File, 'file', (req, res, context, resolve) => {

})

