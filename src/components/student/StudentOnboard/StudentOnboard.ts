import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './StudentOnboard.scss'
import store from '../../../store'
import axios from 'axios'

import * as jwt_decode from 'jwt-decode'

@Component({
    template: require('./StudentOnboard.html'),
    name: 'StudentOnboard',
    components: {}
})

export class StudentOnboard extends Vue {
    @State route

    first_name = ''
    last_name = ''
    email = ''
    password = ''
    passwordConfirm = ''
    submitting = false

    mounted() {
        const token = this.route.query.token
        const user = jwt_decode(token)
        this.email = user.email
    }

    submit() {
        if (this.submitting) {
            return
        }
        if (this.password !== this.passwordConfirm) {
            alert('Passwords do not match')
            return
        }
        this.submitting = true
        store.dispatch('editStudentDetails', {
            first_name: this.first_name,
            last_name: this.last_name,
            password: this.password,
        }).then(student => {
            this.$router.push({
                name: 'studentHome',
            })
        })
    }
}
