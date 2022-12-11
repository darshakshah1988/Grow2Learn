import { Logger } from './logger'

import { values } from 'lodash'

export const getters = {
    subscriptionStatus(state) {
        return (state.subscription && state.subscription.status) || 'deleted'
    },
    currentCard(state) {
    // console.log('currentCard getter')
        const courseId = parseInt(state.route.params.courseId)
        const unitId = parseInt(state.route.params.unitId)
        const cardId = parseInt(state.route.params.cardId)

        if (cardId && state.courses.length > 0) {
            const courseIndex = state.courses.findIndex(course => course.id === courseId)
            const unitIndex = state.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
            if (state.courses[courseIndex].units[unitIndex].cards) {
                const cardIndex = state.courses[courseIndex].units[unitIndex].cards.findIndex(card => card.id === cardId)
                const card = state.courses[courseIndex].units[unitIndex].cards[cardIndex]

                return card
            }
        } else return {}
    },
    currentCourse(state) {
        const id = parseInt(state.route.params.courseId)
        const courseIndex = state.courses.findIndex(course => course.id === id)
        return state.courses[courseIndex]
    },
    registeredStudents(state) {
        const map = {}

        if (state.businesses) {
            state.businesses.forEach(business => {
                if (!business.students) {
                    return
                }
                business.students.forEach(student => {
                    if (student.first_name) {
                        map[student.email] = student
                    }
                })
            })
            return values(map)
        }
    },
    pendingStudents(state) {
        const map = {}

        if (state.businesses) {
            state.businesses.forEach(business => {
                if (!business.students) {
                    return
                }
                business.students.forEach(student => {
                    if (!student.first_name) {
                        map[student.email] = student
                    }
                })
            })
            return values(map)
        }
    },
    activeStudentCourse(state) {
        if (state.student.courses) {
            const id = parseInt(state.route.params.courseId)
            const courseIndex = state.student.courses.findIndex(course => course.id === id)
            const course = state.student.courses[courseIndex]
            return course
        } else return {}
    },
    activeStudentUnitName(state) {
        if (state.student.courses) {
            const id = parseInt(state.route.params.courseId)
            const unitId = parseInt(state.route.params.unitId)
            const courseIndex = state.student.courses.findIndex(course => course.id === id)
            const course = state.student.courses[courseIndex]
            if (course) {
                const unitIndex = state.student.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
                const unit = state.student.courses[courseIndex].units[unitIndex]
                if (!unit) {
                    return 'unknown unit'
                }
                return unit.name
            }
        } else return {}
    },
}
