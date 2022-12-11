import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { BASE_URL } from '../../../constants'

import './AddStudent.scss'
import store from '../../../store'
import axios from 'axios'

@Component({
    template: require('./AddStudent.html'),
    name: 'AddStudent',
    components: {
    }
})

export class AddStudent extends Vue {
    @Inject() studentService
    @Inject() toggleModal

    @Getter registeredStudents

    @State businesses
    @State modals
    @State socket

    @State activeBusinessProfile
    @Watch('activeBusinessProfile', { deep: true })
    watchBusiness(newVal, oldVal) {
        if (newVal) {
            this.businessIds = [newVal.id]
        }
    }

    get showAutosuggest() {
        return this.$route.name === 'course'
    }

    get autosuggestStudents() {
        return this.registeredStudents.filter(student => {
            return student.email.indexOf(this.email) >= 0
        })
    }

    firstName = ''
    lastName = ''
    email = ''
    businessIds = []
    submitting = false

    selectAutosuggest(email) {
        this.email = email
        this.submit()
    }

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('inviteStudent', {
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            businessIds: [
                this.businesses[0].id,
                ...this.businessIds,
            ]
        }).then(student => {
            this.$ua.trackEvent('Invite Student', 'Sent')
            this.firstName = ''
            this.lastName = ''
            this.email = ''
            this.businessIds = []
            this.submitting = false
            this.toggleModal('addStudent')
            this.$router.push({
                name: 'studentProfile',
                params: { studentId: student.id }
            })
        })
    }
}
