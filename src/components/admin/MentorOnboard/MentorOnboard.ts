
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './MentorOnboard.scss'
import store from '../../../store'
import axios from 'axios'

import * as jwt_decode from 'jwt-decode'

@Component({
    template: require('./MentorOnboard.html'),
    name: 'MentorOnboard',
    components: {}
})

export class MentorOnboard extends Vue {
    @State route

    id=''
    first_name = ''
    last_name = ''
    email = ''
    password = ''
    passwordConfirm = ''
    submitting = false

    mounted() {
        const token = this.route.query.token
        const user = jwt_decode(token)
        console.log('---user--',user)
        this.id=user.sub
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

        //console.log(this.first_name+"===>"+this.last_name+"===>"+this.password);
        this.submitting = true
        console.log("submitted data here ");
        console.log(this);
        const user = {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            password: this.password,
            //userType: "mentor"
        }
        console.log("user generated",user);

        store.dispatch('editMentorDetails', {
            password: this.password,
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
        }).then(admin => {
            // this.$router.push({
            //     name: 'dashboard',
            // })
            alert('Your registration process completed.')
            this.$router.push('/l/mentor')
        })
    }
}
