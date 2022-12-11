import { Mutation } from 'vuex-class';
import axios from 'axios'
import { BASE_URL } from './constants'


import { get, includes } from 'lodash'
import * as moment from 'moment'

export const actions = {
    sendDowngradeRequest(context, payload) {
        return axios.post(BASE_URL + '/admin/subscription/downgrade', payload)
            .then(({ data }) => {
                return data
            })
    },
    updateTheme(context, theme) {

        console.log("Context values will come below");
        console.log(context);
        axios.post(BASE_URL + '/admin/update-theme', { theme }).then(res => {
          context.commit('setNotification', {
            type: 'success',
            title: 'Theme changed'
          })
          context.commit('setAdminTheme', theme)
        })
      },
    getSubscription(context) {
        return axios.get(BASE_URL + '/admin/subscription')
            .then(({ data }) => {
                console.log(data);

                if (data.subscriptions.data.length > 1) {
                    for (let i = 1 ; i < data.subscriptions.data.length ; i++) {
                        context.dispatch('cancelOtherSubscriptions', data.subscriptions.data[i].id)
                    }
                }
                return data.subscriptions.data[0]
        })
    },
    cancelOtherSubscriptions(context, subscriptionId) {
        return axios.delete(BASE_URL + '/admin/subscription/' + subscriptionId)
    },
    getSubscriptionProduct(context, subscription) {
        return axios.get(BASE_URL + '/admin/subscription_product/' + subscription.plan.product)
            .then(({ data }) => {
                subscription.product = data
                context.commit('set', {
                    key: 'subscription',
                    value: subscription,
                })
            })
    },
    getStorageUsage(context) {
        return axios.get(BASE_URL + '/admin/storage/size')
            .then(({ data }) => {
                context.commit('set', {
                    key: 'storageUsage',
                    value: data
                })
            })
    },
    getSubscriptionPlans(context) {
        context.commit('setBreadcrumbs', [
            {
                label: 'Subscription Plans',
                link: { name: 'subscriptionPlans' }
            }
        ])
        return axios.get(BASE_URL + '/admin/subscription_plans')
            .then(({ data }) => {
                context.commit('set', {
                    key: 'subscription_plans',
                    value: data.reverse()
                })
            })
    },
    getAdmin(context) {
        context.commit('dashboardLoading', true)
        return axios.get(BASE_URL + '/admin')
            .then(({ data }) => {
            const admin = data
            admin.courses.forEach(course => {
                if (course.sortOrder) {
                    const sortOrder = JSON.parse(course.sortOrder)
                    course.units = course.units.sort((a, b) => {
                        const aIndex = sortOrder.findIndex(d => d === a.id)
                        const bIndex = sortOrder.findIndex(d => d === b.id)
                        if (aIndex === -1 || bIndex === -1) {
                            return false
                        }
                        return aIndex - bIndex
                    })
                }
            })
            context.commit('dashboardLoading', false)
            context.commit('setAdmin', admin)
        })
    },
    createCheckoutSession(context, payload) {
        return axios.post(BASE_URL + '/admin/checkout/session', payload)
            .then(({ data }) => {
                return data
            })
    },
    getCheckoutSession(context, sessionId) {
        return axios.get(BASE_URL + '/admin/checkout/session/' + sessionId)
            .then(({ data }) => {
                return data
            })
    },
    getStudent(context) {
        return axios.get(BASE_URL + '/student').then(res => {
            const notifications = res.data.notifications
            //res.data.notifications = notifications.reverse()
            context.commit('setStudent', res.data.student)
            context.commit('setStudentTheme', res.data.theme)
            return res.data
        })
    },

    getStudentActivity(context) {
        return axios.get(BASE_URL + '/student').then(res => {
            context.commit('setStudent', res.data)
        })
    },

    adminCreateStudentActivity(context, { studentId, text }) {
        context.commit('addStudentActivity', { studentId, text })
        return axios.post(BASE_URL + '/admin/student/activity', { studentId, text }).then(res => {
            console.log('TODO: mutate state')
        })
    },

    getStudentCourse(context, id) {
        console.log("passed id is :"+id);
        return axios.get(BASE_URL + '/student/course/' + id).then(res => {
            const course = res.data
            const promises = res.data.units.map(unit => {
                return axios.get(BASE_URL + '/student/unit/' + unit.id + '/progress').then(res => ({
                    unitId: unit.id,
                    progress: res.data,
                }))
            })
            Promise.all(promises).then(progresses => {
                const map: any = {}
                progresses.forEach((progress: any) => {
                    map[progress.unitId] = progress.progress
                })
                course.units.forEach(unit => {
                    unit.progress = map[unit.id]
                })
                console.log("Here are the courses:");
                console.log(course);
                context.commit('updateStudentCourse', course)
            })
        })
    },

    getFileUrl(context, { format, cardId }) {
        return axios.get(BASE_URL + '/admin/card/' + cardId + '/' + format)
            .then(({ data }) => data)
    },
    getSponsorLogo(context, { format, fileId }) {
        return axios.get(BASE_URL + '/admin/sponsor/' + fileId)
            .then(({ data }) => data)
    },
    getStudentFileUrl(context, { format, cardId }) {
        return axios.get(BASE_URL + '/student/card/' + cardId + '/' + format)
            .then(({ data }) => data)
    },
    getStudentCard(context, { courseId, unitId, cardId }) {
        console.log(context);
        console.log(courseId+ "=>" + unitId + "=>" +cardId);
        if (!context.activeStudentCourse) {
            return axios.get(BASE_URL + '/student/course/' + courseId).then(res => {
                const course = res.data
                const activeUnitIndex = course.units.findIndex(unit => unit.id === unitId)
                const unit = addNextUnitAndCardIds(course, course.units[activeUnitIndex])
                const activeCardIndex = unit.cards.findIndex(card => card.id === cardId)
                // context.commit('setActiveStudentCourse', res.data)
                console.log(res.data);
                context.commit('setActiveStudentCard', unit.cards[activeCardIndex])
            })
        } else {
            console.log(2);
            const activeUnitIndex = context.activeStudentCourse.units.findIndex(unit => unit.id === unitId)
            const unit = addNextUnitAndCardIds(context.activeStudentCourse, context.activeStudentCourse.units[activeUnitIndex])
            const activeCardIndex = unit.cards.findIndex(card => card.id === cardId)
            context.commit('setActiveStudentCard', unit.cards[activeCardIndex])
        }
    },

    editStudentDetails(context, payload) {
        const token = context.state.route.query.token
        return axios.put(BASE_URL + '/update-student-details', payload, { headers: { 'Authorization': 'bearer ' + token } }).then(res => {
            const card = res.data
        })
    },

    editAdminDetails(context, payload) {
        const token = context.state.route.query.token
        return axios.put(BASE_URL + '/update-admin-details', payload, { headers: { 'Authorization': 'bearer ' + token } }).then(res => {
            const card = res.data
        })
    },
    editMentorDetails(context, payload) {
        const token = context.state.route.query.token
        return axios.put(BASE_URL + '/update-mentor-details', payload, { headers: { 'Authorization': 'bearer ' + token } }).then(res => {
            const card = res.data
        })
    },

    submitStudentCard(context, completed) {
        const cardId = context.state.route.params.cardId
        return axios.post(`${BASE_URL}/student/card/${cardId}/submit`, { completed })
    },

    getStudentProfile(context, id) {
        if (!id) {
            console.warn('getStudentProfile requires id. aborting')
            return
        }

        context.commit('setBreadcrumbs', [
            {
                label: 'Members',
                link: { name: 'dashboard' }
            },
            {
                loading: true
            }
        ])
        const getStudentProfile = axios.get(BASE_URL + '/admin/student/' + id).then(res => res.data)
        const getStudentActivity = axios.get(BASE_URL + '/admin/student/' + id + '/activity').then(res => res.data)
        const getStudentProgress = axios.get(BASE_URL + '/admin/student/' + id + '/progress').then(res => res.data)

        return Promise.all([getStudentProfile, getStudentActivity, getStudentProgress]).then(([student, activity, progress]) => {
            student.activity = activity
            student.progress = progress
            if (!student.first_name) {
                context.commit('setBreadcrumbs', [
                    {
                        label: 'Members',
                        link: { name: 'dashboard' }
                    },
                    {
                        label: student.email,
                        link: { name: 'studentProfile', params: { studentId: student.id } }
                    }
                ])
            } else {
                context.commit('setBreadcrumbs', [
                    {
                        label: 'Members',
                        link: { name: 'dashboard' }
                    },
                    {
                        label: student.first_name + ' ' + student.last_name,
                        link: { name: 'studentProfile', params: { studentId: student.id } }
                    }
                ])
            }
            console.log('got student profile', student)
            context.commit('setActiveStudentProfile', student)
        })
    },

    getBusinessProfile(context, id) {
        context.commit('setBreadcrumbs', [
            {
                label: 'Teams'
            },
            {
                loading: true
            }
        ])
        return axios.get(BASE_URL + '/admin/business/' + id).then(res => {
            const business = res.data
            context.commit('setActiveBusinessProfile', business)
            context.commit('setBreadcrumbs', [
                {
                    label: 'Teams'
                },
                {
                    label: business.name,
                    link: { name: 'businessProfile', params: { businessId: business.id } }
                }
            ])
        })
    },

    editBusinessName(context, { businessId, name }) {
        return axios.put(BASE_URL + '/api/business/' + businessId, { name }).then(res => {
            context.commit('setBusinessName', { businessId, name })
        })
    },

    inviteStudent(context, payload) {
        return axios.post(BASE_URL + '/admin/student', payload).then(res => {
            const data = res.data
            
            // context.state.socket.emit('notify-student')
            context.commit('setNotification', {
                type: 'success',
                title: data.studentExists ? 'Student enrolled' : 'Student invited',
                text: 'A confirmation email has been sent to ' + data.email + '.'
            })
            context.dispatch('getStudentProfile', data.id)
            return data
        })
    },

    addStudentCourse(context, payload) {
        return axios.post(BASE_URL + '/admin/student-course', payload).then(res => {
            // context.state.socket.emit('notify-student')
            context.dispatch('getStudentProfile', payload.studentId)

            payload.courseIds.forEach((courseId, i) => {
                context.dispatch('adminCreateStudentActivity', {
                    studentId: payload.studentId,
                    text: 'has been assigned ' + payload.courseNames[i]
                })
            })
            return res.data
        })
    },

    removeStudentFromCourse(context, payload) {
        return axios.delete(BASE_URL + '/admin/student-course', { data: payload }).then(res => {
            // context.state.socket.emit('notify-student')
            context.dispatch('getStudentProfile', payload.studentId)

            context.dispatch('adminCreateStudentActivity', {
                studentId: payload.studentId,
                text: 'has been unassigned ' + payload.courseName
            })
            return res.data
        })
    },

    addStudentBusiness(context, payload) {
        console.log('addStudentBusiness', payload)
        return axios.post(BASE_URL + '/admin/student-business', payload).then(res => {
            context.dispatch('getStudentProfile', payload.studentId)

            payload.businessIds.forEach((businessId, i) => {
                context.dispatch('adminCreateStudentActivity', {
                    studentId: payload.studentId,
                    text: 'has been added to ' + payload.businessNames[i]
                })
            })
            return res.data
        })
    },

    removeStudentFromBusiness(context, payload) {
        return axios.delete(BASE_URL + '/admin/student-business', { data: payload }).then(res => {
            // context.state.socket.emit('notify-student')
            context.dispatch('getStudentProfile', payload.studentId)

            context.dispatch('adminCreateStudentActivity', {
                studentId: payload.studentId,
                text: 'has been removed from ' + payload.businessName
            })
            return res.data
        })
    },

    fetchCurrentCourse(context) {
        context.commit('setBreadcrumbs', [
            {
                loading: true
            }
        ])
        context.dispatch('fetchCourse', context.state.route.params.courseId)
    },

    fetchCourse(context, id) {
        return axios.get(BASE_URL + '/admin/course/' + id)
            .then(res => {
                const course = res.data
                context.commit('setBreadcrumbs', [
                    {
                        label: course.name,
                        link: { name: 'course', params: { courseId: course.id } }
                    }
                ])
                context.commit('setSponsors', res.data.sponsors)
                return res.data
            })
    },

    fetchUnit(context, unitId) {
        context.commit('setBreadcrumbs', [
            {
                loading: true
            }
        ])
        return axios.get(BASE_URL + '/admin/unit/' + unitId)
            .then(res => {
                const unit = res.data
                if (!unit) {
                    console.warn('could not find unit', unit.id)
                }
                context.commit('setUnitInCourse', { unit, courseId: unit.courseId })
                // Not the right place to do this
                const activeCardIndex = unit.cards.findIndex(card => card.id === parseInt(context.state.route.params.cardId))
                const activeCard = unit.cards[activeCardIndex]
                context.commit('setBreadcrumbs', [
                    {
                        label: unit.course.name,
                        link: { name: 'course', params: { courseId: unit.course.id } }
                    },
                    {
                        label: unit.name,
                        link: { name: 'course', params: { courseId: unit.course.id } }
                    }
                ])
            })
    },

    fetchStudentProgress(context, student) {
        return axios.get(BASE_URL + '/admin/student/' + student.studentId + '/progress')
            .then(res => {
                const progress = res.data
                return progress
            })
    },

    createCourse(context, { name, businessIds, checkCount}) {
        return axios.post(BASE_URL + '/admin/course', {
            name,
            businessIds,
            checkCount
        }).then(res => {
            const course = res.data
            course.students = []
            course.units = []
            context.commit('createCourse', course)
            context.commit('setNotification', {
                type: 'success',
                title: course.name + ' created',
                text: 'Now create Units and fill them with Cards'
            })
            return course
        })
    },

    removeCourse(context, id) {
        id = parseInt(id)
        return axios.delete(BASE_URL + '/api/course/' + id).then(res => {
            // context.state.socket.emit('notify-student')
            context.commit('removeCourse', id)
            context.commit('setNotification', {
                title: 'Content Removed'
            })
        })
    },

    removeStudent(context, id) {
        return axios.delete(BASE_URL + '/admin/student/' + id).then(res => {
            context.state.socket.emit('notifiy-student')
            context.dispatch('getAdmin')
            context.commit('setNotification', {
                title: 'Member removed'
            })
        })
    },

    removeBusiness(context, id) {
        return axios.delete(BASE_URL + '/api/business/' + id).then(res => {
            // context.state.socket.emit('notify-student')
            context.dispatch('getAdmin')
            context.commit('setNotification', {
                title: 'Team removed'
            })
        })
    },

    createUnit(context, { courseId, name }) {
        return axios.post(BASE_URL + '/admin/unit', {
            courseId,
            name,
        }).then(res => {
            const unit = res.data
            context.commit('createUnit', { courseId, unit })
        })
    },

    editUnitName(context, { courseId, unitId, name }) {
        return axios.put(BASE_URL + '/api/unit/' + unitId, { name }).then(res => {
            context.commit('setUnitName', { courseId, unitId, name })
        })
    },

    editUnitSortOrder(context, { courseId, unitId, sortOrder }) {
        return axios.put(BASE_URL + '/api/unit/' + unitId, { sortOrder }).then(res => {
            // context.commit('setUnitSortOrder', { courseId, unitId, sortOrder })
        })
    },

    editCourseName(context, { courseId, name }) {
        return axios.put(BASE_URL + '/api/course/' + courseId, { name }).then(res => {
            context.commit('setCourseName', { courseId, name })
        })
    },

    editCourseSortOrder(context, { courseId, sortOrder }) {
        return axios.put(BASE_URL + '/api/course/' + courseId, { sortOrder }).then(res => {
            context.commit('setCourseSortOrder', { courseId, sortOrder })
        })
    },

    removeUnit(context, id) {
        return axios.delete(BASE_URL + '/api/unit/' + id).then(res => {
            context.commit('removeUnit', id)
        })
    },

    createCard(context, { courseId, unitId, name }) {
        return axios.post(BASE_URL + '/admin/unit/' + unitId + '/card', {
            courseId,
            unitId,
            name,
            cardType:"default"
        }).then(res => {
            const card = res.data
            context.commit('createCard', { courseId, unitId, card })
            return card
        })
    },

    createMeetingCard(context, { courseId, unitId, name,time,cardType }) {
        return axios.post(BASE_URL + '/admin/unit/' + unitId + '/meetingcard', {
            courseId,
            unitId,
            name,
            time,
            cardType
        }).then(res => {
            const card = res.data
            context.commit('createCard', { courseId, unitId, card,time,cardType })
            return card
        })
    },

    removeCardAudio(context, { courseId, unitId, cardId }) {
        return axios.delete(`${BASE_URL}/admin/card/${cardId}/audio`).then(res => {
            context.commit('setActiveCardAudio', { courseId, unitId, cardId, file: null })
        })
    },

    removeCardVideo(context, { courseId, unitId, cardId }) {
        return axios.delete(`${BASE_URL}/admin/card/${cardId}/video`, {
            data: {
                subscriptionPlan: context.state.subscription.product.name
            }
        }).then(res => {
            context.commit('setActiveCardVideo', { courseId, unitId, cardId, file: null })
        })
    },

    editCard(context, { card }) {
        return axios.put(BASE_URL + '/api/card/' + card.id, card).then(res => {
            const card = res.data
            // context.commit('updateCard', { card })
        })
    },

    removeCard(context, id) {
        return axios.delete(BASE_URL + '/api/card/' + id).then(res => {
            // ...
        })
    },

    // updatePaymentMethod(context, payload) {
    //     return axios.post('/admin/subscription', payload).then(res => {
    //         const customer = res.data
    //         const status = get(customer, 'subscriptions.data[0].status')
    //         context.commit('setSubscriptionStatus', status)
    //     })
    // },

    updateActiveCard(context, card) {
        return axios.put(BASE_URL + '/api/card/' + card.id, card).then(res => {
            const card = res.data
            context.commit('setNotification', {
                type: 'success',
                title: 'Card saved'
            })
        })
    },

    updateActiveCardQuiz(context, quiz) {
        const courseId = parseInt(context.state.route.params.courseId)
        const unitId = parseInt(context.state.route.params.unitId)
        const cardId = parseInt(context.state.route.params.cardId)

        const courseIndex = context.state.courses.findIndex(course => course.id === courseId)
        const unitIndex = context.state.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
        const cardIndex = context.state.courses[courseIndex].units[unitIndex].cards.findIndex(card => card.id === cardId)

        const card = context.state.courses[courseIndex].units[unitIndex].cards[cardIndex]

        context.commit('setActiveCardQuiz', { courseId, unitId, cardId, quiz: JSON.stringify(quiz) })
        return axios.put(BASE_URL + '/api/card/' + cardId, card).then(res => {
            const card = res.data
            context.commit('setNotification', {
                type: 'success',
                title: 'Quiz updated'
            })
        })
    },

    createBusiness(context, { name, courseIds }) {
        return axios.post(BASE_URL + '/admin/business', {
            name,
            courseIds,
        }).then(res => {
            const business = res.data
            context.commit('createBusiness', business)
            context.commit('setNotification', {
                type: 'success',
                title: business.name + ' created',
                text: 'You can now set default causes and invite students for to this business.'
            })
            return business
        })
    },

    setAppView(context, view) {
        context.commit('setAppView', view)
    },

    addBusinessCourse(context, payload) {
        return axios.post(BASE_URL + '/admin/business-course', payload).then(res => {
            context.dispatch('getBusinessProfile', payload.businessId)
            return res.data
        })
    },

    removeCourseFromBusiness(context, payload) {
        return axios.delete(BASE_URL + '/admin/business-course', { data: payload }).then(res => {
            context.dispatch('getBusinessProfile', payload.businessId)
            return res.data
        })
    },
    addSponsor(context, payload) {
        return axios.post(BASE_URL + '/admin/sponsor', payload).then(res => {
            context.commit('setNotification', {
                title: 'Sponsor Added'
            })
            return res.data
        })
    },
    editSponsor(context, {name, website, message,logo,id}) {
        return axios.put(BASE_URL + '/admin/sponsor/'+id, {
            name, website, message,logo
        }).then(res => {
            context.commit('setNotification', {
                title: 'Sponsor updated'
            })
            return res.data
        })
    },
    getSponsor(context, payload) {
        const courseId = context.state.route.params.courseId;
        return axios.get(BASE_URL + '/admin/sponsor'+courseId).then(res => {
            context.commit('setNotification', {
                title: 'Sponsor Added'
            })
            return res.data
        })
    },
    inviteMentor(context, payload) {
        console.log("Mentor data on the go");
        console.log(payload);
        return axios.post(BASE_URL + '/mentor/invite', payload).then(res => {
            const data = res.data
            
            
            // context.state.socket.emit('notify-student')
            context.commit('setNotification', {
                type: 'success',
                title: data.studentExists ? 'Mentor Assigned' : 'Mentor invited',
                text: 'A confirmation email has been sent to ' + payload.email + '.'
            })
            return data
        })
    }
}

const addNextUnitAndCardIds = (course, unit) => {
    let nextUnitId = null
    course.units.forEach((d, i) => {
        const nextUnit = course.units[i + 1]
        if (d.id === unit.id && nextUnit) {
            nextUnitId = nextUnit.id
        }
    })
    unit.cards.forEach((card, i) => {
        const nextCard = unit.cards[i + 1]
        if (nextCard) {
            card.nextCardId = nextCard.id
        } else if (nextUnitId) {
            card.nextUnitId = nextUnitId
        }
    })

    return unit
}

