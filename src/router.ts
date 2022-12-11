import Vue from 'vue'
import VueRouter, { Location, Route, RouteConfig } from 'vue-router'
import { makeHot, reload } from './util/hot-reload'

const loginComponent = () => import('./components/shared/Login').then(({ Login }) => Login)
const landingComponent = () => import('./components/landing').then(({ LandingComponent }) => LandingComponent)
const adminComponent = () => import('./components/admin/Admin').then(({ Admin }) => Admin)
const studentAppComponent = () => import('./components/student/Student').then(({ Student }) => Student)
const adminOnboard = () => import('./components/admin/AdminOnboard').then(({ AdminOnboard }) => AdminOnboard)
const mentorOnboard = () => import('./components/admin/MentorOnboard').then(({ MentorOnboard }) => MentorOnboard)
const studentOnboard = () => import('./components/student/StudentOnboard').then(({ StudentOnboard }) => StudentOnboard)
const styleguideComponent = () => import('./components/shared/styleguide').then(({ StyleguideComponent }) => StyleguideComponent)
const resetPassword = () => import('./components/shared/ResetPassword').then(({ ResetPassword }) => ResetPassword)

Vue.use(VueRouter)

export const createRoutes: () => RouteConfig[] = () => [
    {
        path: '/',
        name: 'landing',
        component: landingComponent
    },
    {
        path: '/l/:role',
        name: 'login',
        component: loginComponent
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: adminComponent
    },
    {
        path: '/success',
        name: 'success',
        component: adminComponent
    },
    {
        path: '/canceled',
        name: 'canceled',
        component: adminComponent
    },
    {
        path: '/s/:studentId',
        name: 'studentProfile',
        component: adminComponent
    },
    {
        path: '/b/:businessId',
        name: 'businessProfile',
        component: adminComponent
    },
    {
        path: '/c/:courseId',
        name: 'course',
        component: adminComponent
    },
    {
        path: '/c/:courseId/:unitId/:cardId',
        name: 'card',
        component: adminComponent
    },
    {
        path: '/subscription-plans',
        name: 'subscriptionPlans',
        component: adminComponent
    },
    {
        path: '/app',
        name: 'studentHome',
        component: studentAppComponent
    },
    {
        path: '/invite',
        name: 'studentInvite',
        component: studentOnboard
    },
    {
        path: '/confirm',
        name: 'adminConfirm',
        component: adminOnboard
    },
    {
        path: '/mconfirm',
        name: 'mentorConfirm',
        component: mentorOnboard
    },
    {
        path: '/app/:courseId',
        name: 'studentCourse',
        component: studentAppComponent
    },
    {
        path: '/app/:courseId/:unitId/:cardId',
        name: 'studentCard',
        component: studentAppComponent
    },
    {
        path: '/app/:courseId/:unitId',
        name: 'studentUnit',
        component: studentAppComponent
    },
    {
        path: '/styleguide',
        component: styleguideComponent
    },
    {
        path: '/reset-password',
        name: 'resetPassword',
        component: resetPassword
    }
]

export const createRouter = () => new VueRouter({ mode: 'history', routes: createRoutes() })
