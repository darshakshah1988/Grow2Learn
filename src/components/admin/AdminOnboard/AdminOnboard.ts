import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './AdminOnboard.scss'
import store from '../../../store'
import axios from 'axios'

import * as jwt_decode from 'jwt-decode'

@Component({
    template: require('./AdminOnboard.html'),
    name: 'AdminOnboard',
    components: {}
})

export class AdminOnboard extends Vue {
    @State route

    email = ''
    password = ''
    passwordConfirm = ''
    firstName = ''
    submitting = false

    mounted() {
        const token = this.route.query.token
        const user = jwt_decode(token)
        this.email = user.email
        this.firstName = user.firstName
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
        store.dispatch('editAdminDetails', {
            password: this.password
        }).then(admin => {
            this.$router.push({
                name: 'dashboard',
            })
        })
    }
}
