import { Component, Prop, Watch, Vue, Provide } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import * as moment from 'moment'

import { CourseService, BusinessService, StudentService, UnitService } from '../../../services'

import { AddStudent, AddStudentBusiness, AddStudentCourse, AddUnit, AddCard, AddBusiness, EditProfile, Breadcrumbs, StudentList, StudentProfile, Toast, BusinessProfile, LearningCard, Course, Businesses, CourseMenu, RemoveStudentCourse, RemoveStudentBusiness, AddCourse, RemoveCard, RemoveVideo, RemoveAudio, RemoveBusiness, RemoveStudent, RemoveCourse, RemoveUnit, RemoveBusinessCourse, AddBusinessCourse, SubscriptionPlanList, CardType, AddSponsor, MeetingCard, AddMentor } from '../../'

import { Login } from '../../shared/Login'
import { ProgressBar } from '../../shared/ProgressBar'

import './Admin.scss'
import store from '../../../store'
import axios from 'axios'
import { request } from 'http'
import TawkMessengerVue from '@tawk.to/tawk-messenger-vue-2';
const toggleModal = k => store.commit('toggleModal', k)

@Component({
    template: require('./Admin.html'),
    name: 'Admin',
    directives: { focus: focus },
    components: {
        AddBusiness,
        AddBusinessCourse,
        AddCard,
        AddCourse,
        EditProfile,
        AddStudent,
        AddMentor,
        AddStudentBusiness,
        AddStudentCourse,
        AddUnit,
        Breadcrumbs,
        BusinessProfile,
        Course,
        CourseMenu,
        LearningCard,
        Login,
        RemoveAudio,
        RemoveBusiness,
        RemoveBusinessCourse,
        RemoveCard,
        RemoveCourse,
        RemoveStudent,
        RemoveStudentBusiness,
        RemoveStudentCourse,
        RemoveUnit,
        RemoveVideo,
        StudentList,
        StudentProfile,
        Toast,
        SubscriptionPlanList,
        ProgressBar,
        CardType,
        AddSponsor,
        MeetingCard
    }
})

export class Admin extends Vue {

    @Prop() theme: string

    @Provide() studentService = new StudentService()
    @Provide() businessService = new BusinessService()
    @Provide() unitService = new UnitService()
    @Provide() toggleModal = toggleModal

    @Getter currentCourse
    @Getter registeredStudents
    @Getter pendingStudents
    @Getter subscriptionStatus

    @State courses
    @State businesses
    @State authed
    @State user
    @State modals
    @State breadcrumbs
    @State route
    @State admin
    @State sidebarOpen
    @State subscription
    @State dashboardLoading
    @State storageUsage
    ready = false



    @Watch('sidebarOpen')
    watchSidebarOpen(newVal, oldVal) {
        if (newVal) {
            document.addEventListener('click', this.toggleSidebar)
        } else {
            document.removeEventListener('click', this.toggleSidebar)
        }
    }

    $refs: {
        checkoutRef: any,
        course: any,
        paywall: any,
        wrapper: any,
        loadingscreen: any,
        content: any
    }

    menuVisible = false

    @Watch('dashboardLoading')
    watchDashboardLoading(newVal, oldVal) {
        console.log("Now calling dashboard loading menu");

        if (!newVal) {

            //   this.$refs.loadingscreen.setAttribute('hidden', true)
            //   this.$refs.content.removeAttribute('hidden')
        }
    }

    @Watch('menuVisible')
    watchAdmin(newVal, oldVal) {
        if (newVal) {
            document.addEventListener('click', this.toggleMenu)
        } else {
            document.removeEventListener('click', this.toggleMenu)
        }
    }

    toggleMenu() {
        this.menuVisible = !this.menuVisible
    }

    get isNotActive() {
        return this.subscriptionStatus !== 'active' && this.subscriptionStatus !== 'past_due'
    }

    get inviteButtonLabel() {
        return this.$route.name === 'course' ? 'Enrol Student' : 'Invite Student'
    }

    get totalStudents() {
        return this.registeredStudents.length + this.pendingStudents.length
    }

    get courseMenu() {
        if (this.courses) {
            const menu = this.courses.map((course, index) => {
                const data = {
                    text: course.name,
                    link: '/c/' + course.id,
                    total: course.units ? course.units.length : 0,
                }
                return data
            })
            return menu
        }
    }

    get businessMenu() {
        if (this.businesses) {
            // WARNING: always omit first business
            const menu = this.businesses.slice(1).map((business, index) => {
                const data = {
                    text: business.name,
                    link: '/b/' + business.id,
                    total: business.students ? business.students.length : 0,
                }
                return data
            })
            return menu
        }
    }

    get membersMenu() {
        const map = []
        if (this.businesses) {
            this.businesses.forEach(business => {
                if (!business.students) {
                    return
                }
                business.students.forEach(student => {
                    let data;
                    if (student.first_name) {
                        data = {
                            text: student.first_name + ' ' + student.last_name,
                            link: '/b/' + student.id,
                            total: '',
                        }
                    }
                    if (!student.first_name) {
                        data = {
                            text: student.email,
                            link: '/b/' + student.id,
                            total: '',
                        }
                    }
                    map.push(data)
                })
            })
            return map
        }
    }

    get items() {
        return [{
            plan: 0,
            //plan: this.subscription.plan.id,
            quantity: 1
        }]
    }

    handleUnitAdded() {
        this.$refs.course.sortUnits()
    }

    inviteStudent() {
        this.$ua.trackEvent('Invite Student', 'Open Modal')
        toggleModal('addStudent')
    }
    inviteMentor() {
        this.$ua.trackEvent('Invite Mentor', 'Open Modal')
        toggleModal('addMentor')
    }
    addSponsor() {
        this.$ua.trackEvent('Add Sponsor', 'Open Modal')
        toggleModal('addSponsor')
    }
    removeStudent() {
        store.commit('set', {
            key: 'removeStudentId',
            value: this.$route.params.studentId
        })
        this.toggleModal('removeStudent')
    }

    removeBusiness() {
        store.commit('set', {
            key: 'removeBusinessId',
            value: this.$route.params.businessId
        })
        this.toggleModal('removeBusiness')
    }

    removeCourse() {
        store.commit('set', {
            key: 'removeCourseId',
            value: this.$route.params.courseId
        })
        this.toggleModal('removeCourse')
    }

    removeCard() {
        store.commit('set', {
            key: 'removeCardId',
            value: this.route.params.cardId
        })
        this.toggleModal('removeCard')
    }

    toggleSidebar() {
        store.commit('toggleSidebar')
    }

    printReport() {
        window.print();
    }

    async mounted() {
        console.log(this.currentCourse, this.user);
        const url = new URL(window.location.toString())

        // //console.log("inside the admin dashboard");

        const subscription = await store.dispatch('getSubscription')
        //console.log("subscription",subscription)
        //const subscription = ''

        // //const subscription = '{"id":"cus_I4gB911l0oSygb","object":"customer","address":null,"balance":0,"created":1600863127,"currency":"usd","default_source":null,"delinquent":false,"description":"Admin for EXX Club","discount":null,"email":"smartdarshak88@gmail.com","invoice_prefix":"A319A2DC","invoice_settings":{"custom_fields":null,"default_payment_method":null,"footer":null},"livemode":false,"metadata":{},"name":"Smart Darshak","next_invoice_sequence":4,"phone":null,"preferred_locales":[],"shipping":null,"sources":{"object":"list","data":[],"has_more":false,"total_count":0,"url":"/v1/customers/cus_I4gB911l0oSygb/sources"},"subscriptions":{"object":"list","data":[{"id":"sub_I4gBDlXPVAc2U5","object":"subscription","application_fee_percent":null,"billing_cycle_anchor":1600863128,"billing_thresholds":null,"cancel_at":null,"cancel_at_period_end":false,"canceled_at":null,"collection_method":"charge_automatically","created":1600863128,"current_period_end":1608725528,"current_period_start":1606133528,"customer":"cus_I4gB911l0oSygb","days_until_due":null,"default_payment_method":null,"default_source":null,"default_tax_rates":[],"discount":null,"ended_at":null,"items":{"object":"list","data":[{"id":"si_I4gBfaQ6yO3ZXB","object":"subscription_item","billing_thresholds":null,"created":1600863128,"metadata":{},"plan":{"id":"price_1HNwiHJq9lBFiVSrTp9rQSvj","object":"plan","active":true,"aggregate_usage":null,"amount":0,"amount_decimal":"0","billing_scheme":"per_unit","created":1599294333,"currency":"usd","interval":"month","interval_count":1,"livemode":false,"metadata":{},"nickname":null,"product":"prod_HxsTiuJBth3Kfc","tiers":null,"tiers_mode":null,"transform_usage":null,"trial_period_days":null,"usage_type":"licensed"},"price":{"id":"price_1HNwiHJq9lBFiVSrTp9rQSvj","object":"price","active":true,"billing_scheme":"per_unit","created":1599294333,"currency":"usd","livemode":false,"lookup_key":null,"metadata":{},"nickname":null,"product":"prod_HxsTiuJBth3Kfc","recurring":{"aggregate_usage":null,"interval":"month","interval_count":1,"trial_period_days":null,"usage_type":"licensed"},"tiers_mode":null,"transform_quantity":null,"type":"recurring","unit_amount":0,"unit_amount_decimal":"0"},"quantity":1,"subscription":"sub_I4gBDlXPVAc2U5","tax_rates":[]}],"has_more":false,"total_count":1,"url":"/v1/subscription_items?subscription=sub_I4gBDlXPVAc2U5"},"latest_invoice":"in_1HqduHJq9lBFiVSrugjSzDLo","livemode":false,"metadata":{},"next_pending_invoice_item_invoice":null,"pause_collection":null,"pending_invoice_item_interval":null,"pending_setup_intent":null,"pending_update":null,"plan":{"id":"price_1HNwiHJq9lBFiVSrTp9rQSvj","object":"plan","active":true,"aggregate_usage":null,"amount":0,"amount_decimal":"0","billing_scheme":"per_unit","created":1599294333,"currency":"usd","interval":"month","interval_count":1,"livemode":false,"metadata":{},"nickname":null,"product":"prod_HxsTiuJBth3Kfc","tiers":null,"tiers_mode":null,"transform_usage":null,"trial_period_days":null,"usage_type":"licensed"},"quantity":1,"schedule":null,"start_date":1600863128,"status":"active","tax_percent":null,"transfer_data":null,"trial_end":null,"trial_start":null}],"has_more":false,"total_count":1,"url":"/v1/customers/cus_I4gB911l0oSygb/subscriptions"},"tax_exempt":"none","tax_ids":{"object":"list","data":[],"has_more":false,"total_count":0,"url":"/v1/customers/cus_I4gB911l0oSygb/tax_ids"}}';
        // console.log(subscription);
        await store.dispatch('getAdmin')
        await store.dispatch('getSubscriptionProduct', subscription)
        await store.dispatch('getStorageUsage', subscription)

        this.ready = true

        if (url.searchParams.has('session_id')) {
            const session = await store.dispatch('getCheckoutSession', url.searchParams.get('session_id'))
            if (!session.error) {
                this.$notify({
                    group: 'admin_notifs',
                    //text: `You are now subscribed to ${subscription.product.name}`,
                    text: `You are now subscribed to plan`,
                    duration: 10000
                })
                url.searchParams.delete('session_id')
                window.history.pushState({}, document.title, url.href)
            }
        }
        Vue.use(TawkMessengerVue, {
            propertyId : '62f6022454f06e12d88e35b1',
            widgetId : '1ga8fgoo9'
        });
        //console.log("We are into mentor login page ");
    }
}
