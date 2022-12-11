import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import axios from 'axios'
import { BASE_URL } from '../../../constants'

import { Card } from '../Card'
import { Logger } from '../../../logger'
import { Modal } from '../Modal'

import './Login.scss'
import store from '../../../store'

@Component({
    template: require('./Login.html'),
    name: 'Login',
    components: {
        // Card,
        Modal,
    }
})

export class Login extends Vue {

    email = ''
    password = ''
    submitting = false
    error = false
    errorMessage = ''
    forgot = false
    passwordResetSent = false

    @State route

    get role() {
        return this.route.params.role
    }

    login(e) {
        e.preventDefault()
        this.error = false
        this.errorMessage = ''
        this.passwordResetSent
        this.submitting = true
        const endpoint = this.role === 'creator'  ? 'admin' : this.role === 'mentor' ? 'admin':'student'
        if (this.forgot) {
            axios.post(BASE_URL + '/forgot-password', {
                email: this.email,
            }).then(res => {
                if (res.data.success) {
                    this.passwordResetSent = true
                } else {
                    this.error = true
                    this.errorMessage = res.data.message
                }
                this.submitting = false
            })
            return
        }
        axios.post(BASE_URL + '/login/' + endpoint, {
            email: this.email,
            password: this.password
        }).then(res => {
            this.submitting = false
            const user = res.data
            if (res.status === 200 && user.id) {
                store.commit('setUser', user)
                if (this.role === 'creator' || this.role === 'mentor') {
                    //console.log(user);
                    this.$router.push({ name: 'dashboard' })
                } else {
                    //console.log(user);
                    this.$router.push({ name: 'studentHome' })
                }
            } else {
                this.error = true
            }
        }).catch(() => {
            this.error = true
            this.submitting = false
        })
    }

}
