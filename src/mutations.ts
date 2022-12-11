import { Vue } from 'vue-property-decorator';
import { assign } from 'lodash'
import { BASE_URL } from './constants'
import * as io from 'socket.io-client'

export const mutations = {
    dashboardLoading(state, loading) {
        state.dashboardLoading = loading
    },
    // setSubscriptionStatus(state, status) {
    //     state.subscriptionStatus = status
    // },
    setAdmin(state, admin) {
        state.admin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            stripe_cust_id: admin.stripe_cust_id,
            theme: admin.theme,
            logo_url: admin.logo_url,
            userType: admin.userType
        }
        state.courses = admin.courses
        state.businesses = admin.businesses
        // state.authed = overview.user && overview.user.id
        state.authed = true
    },
    setSponsors(state, sponsors) {
        console.log('mut-addspo', sponsors);

        state.sponsors = sponsors
    },
    setStudent(state, student) {
        state.student = student
        state.authed = true
    },
    set(state, { key, value }) {
        state[key] = value
    },
    setStudentProgress(state, { businessId, studentId, progress }) {
        const businessIndex = state.businesses.findIndex(business => business.id === businessId)
        const studentIndex = state.businesses[businessIndex].students.findIndex(student => student.id === studentId)
        state.businesses[businessIndex].students[studentIndex].BusinessStudent.progress = progress
    },
    setUnitName(state, { courseId, unitId, name }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]

        const unitIndex = course.units.findIndex(unit => unit.id === unitId)
        const unit = course.units[unitIndex]

        unit.name = name

        // https://stackoverflow.com/questions/40860592/vuex-getter-not-updating
        course.units.slice(unitIndex, 1, unit)
        state.courses.splice(courseIndex, 1, course)
    },
    setCourseName(state, { courseId, name }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]

        course.name = name

        // https://stackoverflow.com/questions/40860592/vuex-getter-not-updating
        state.courses.splice(courseIndex, 1, course)
    },
    setBusinessName(state, { businessId, name }) {
        const businessIndex = state.businesses.findIndex(business => business.id === businessId)
        const business = state.businesses[businessIndex]
        business.name = name
        state.businesses.splice(businessIndex, 1, business)
    },
    setCourseSortOrder(state, { courseId, sortOrder }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]
        course.sortOrder = sortOrder
        state.courses.splice(courseIndex, 1, course)
    },
    setUnitProgress(state, { courseId, unitId, payload }) {
        const courseIndex = state.student.courses.findIndex(course => course.id === courseId)
        const unitIndex = state.student.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
        assign(state.student.courses[courseIndex].units[unitIndex], { progress: payload })
    },
    setLogoUrl(state, url) {
        Vue.set(state.admin, 'logo_url', url)
    },
    setAdminTheme(state, theme) {
        Vue.set(state.admin, 'theme', theme)
    },
    setStudentTheme(state, theme) {
        Vue.set(state.student, 'theme', theme)
    },
    updateStudentCourse(state, payload) {
        const courseIndex = state.student.courses.findIndex(course => course.id === payload.id)
        assign(state.student.courses[courseIndex], payload)
    },
    setNotification(state, payload) {
        state.notification = payload
    },
    setActiveCard(state, card) {
        state.activeCard = card
    },
    setActiveCardQuiz(state, { courseId, unitId, cardId, quiz }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const unitIndex = state.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
        const cardIndex = state.courses[courseIndex].units[unitIndex].cards.findIndex(card => card.id === cardId)

        const card = state.courses[courseIndex].units[unitIndex].cards[cardIndex]
        card.quiz = quiz
    },
    setActiveCardAudio(state, { courseId, unitId, cardId, file }) {

        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]

        const unitIndex = course.units.findIndex(unit => unit.id === unitId)
        const unit = course.units[unitIndex]

        const cardIndex = state.courses[courseIndex].units[unitIndex].cards.findIndex(card => card.id === cardId)
        const card = state.courses[courseIndex].units[unitIndex].cards[cardIndex]
        card.audio = file

        // https://stackoverflow.com/questions/40860592/vuex-getter-not-updating
        unit.cards.slice(cardIndex, 1, card)
        course.units.slice(unitIndex, 1, unit)
        state.courses.splice(courseIndex, 1, course)
    },
    setActiveCardVideo(state, { courseId, unitId, cardId, file }) {

        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]

        const unitIndex = course.units.findIndex(unit => unit.id === unitId)
        const unit = course.units[unitIndex]

        const cardIndex = state.courses[courseIndex].units[unitIndex].cards.findIndex(card => card.id === cardId)
        const card = state.courses[courseIndex].units[unitIndex].cards[cardIndex]
        card.video = file

        // https://stackoverflow.com/questions/40860592/vuex-getter-not-updating
        unit.cards.slice(cardIndex, 1, card)
        course.units.slice(unitIndex, 1, unit)
        state.courses.splice(courseIndex, 1, course)
    },
    setActiveStudentCard(state, card) {
        state.activeStudentCard = card
    },
    setDeleteStudentCourseId(state, id) {
        state.deleteStudentCourseId = id
    },
    setDeleteStudentBusinessId(state, id) {
        state.deleteStudentBusinessId = id
    },
    setActiveStudentProfile(state, student) {
        state.activeStudentProfile = student
        state.businesses.forEach((business, businessIndex) => {
            if (business.students) {
                const studentIndex = business.students.findIndex(d => d.id === student.id)
                business.students[studentIndex] = student
            }
        })
    },
    setActiveBusinessProfile(state, profile) {
        state.activeBusinessProfile = profile
    },
    setUser(state, user) {
        state.authed = true
        state.user = user
    },
    setBreadcrumbs(state, crumbs) {
        state.breadcrumbs = crumbs
    },
    createCourse(state, course) {
        state.courses.push(course)
    },
    toggleModal(state, k) {
        state.modals[k] = !state.modals[k]
    },
    createBusiness(state, business) {
        state.businesses.push(business)
    },
    addOrUpdateStudent(state, { student, businessIds }) {
        console.log('todo: add student to appropriate courses too')
        // state.businesses = state.businesses.map(business => {
        //   if (businessIds.indexOf(business.id) >= 0) {
        //     business.students.push(student)
        //   }
        // })
    },
    createUnit(state, { courseId, unit }) {
        const i = state.courses.findIndex(course => course.id === courseId)
        state.courses[i].units.push(unit)
    },
    setUnitInCourse(state, { unit, courseId }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const course = state.courses[courseIndex]

        const unitIndex = course.units.findIndex(u => u.id === unit.id)

        course.units[unitIndex] = unit
        state.courses.splice(courseIndex, 1, course)
    },
    removeUnit(state, id) {
        state.courses.forEach(course => {
            course.units = course.units.filter(unit => unit.id !== id)
        })
    },
    removeCourse(state, id) {
        state.courses = state.courses.filter(course => course.id !== id)
    },
    createCard(state, { courseId, unitId, card }) {
        const courseIndex = state.courses.findIndex(course => course.id === courseId)
        const unitIndex = state.courses[courseIndex].units.findIndex(unit => unit.id === unitId)
        state.courses[courseIndex].units[unitIndex].cards.push(card)
    },
    reset(state) {
        state.courses = []
        state.businesses = []
    },
    setAppView(state, view) {
        state.appView = view
    },
    toggleSidebar(state) {
        state.sidebarOpen = !state.sidebarOpen
    },
    addStudentActivity(state, activity) {
        console.log('addStudentActivity', activity)
        // state.businesses.forEach((business, businessIndex) => {
        //   const studentIndex = business.students.findIndex(student => student.id === activity.studentId)
        //   if (studentIndex !== -1) {
        //     let student = business.students[studentIndex]
        //     student.activity.push(activity)
        //     console.log('studentIndex', studentIndex)
        //   }
        // })
    },
    setSocket(state, email) {
        console.log("Checking why wrong");
        console.log(state);
        // state.socket = io(`${BASE_URL}/socket/student?email=${window.encodeURIComponent(email)}`, {
        //     path: '/headway'
        // })
    }
}
