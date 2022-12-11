import { Component, Prop, Vue } from 'vue-property-decorator'

import './ResetPassword.scss'
import { State } from '../../../../node_modules/vuex-class'

import * as jwt_decode from 'jwt-decode'
import store from '../../../store'

@Component({
    template: require('./ResetPassword.html'),
    name: 'ResetPassword',
    components: {}
})

export class ResetPassword extends Vue {
    @State route

    email = ''
    password = ''
    userType = 'admin'
    passwordConfirm = ''
    submitting = false

    mounted() {
        const token = this.route.query.token
        const user = jwt_decode(token)
        this.email = user.email
        this.userType = user.userType
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

        if (this.userType === 'student') {
            store.dispatch('editStudentDetails', {
                password: this.password,
            }).then(student => {
                this.$router.push({
                    name: 'studentHome',
                })
                this.submitting = false
            })
        } else {
            store.dispatch('editAdminDetails', {
                password: this.password
            }).then(admin => {
                this.$router.push({
                    name: 'dashboard',
                })
                this.submitting = false
            })
        }
    }

}
