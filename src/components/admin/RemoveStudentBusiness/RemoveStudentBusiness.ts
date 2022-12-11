import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveStudentBusiness.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveStudentBusiness.html'),
    name: 'RemoveStudentBusiness',
    components: {}
})

export class RemoveStudentBusiness extends Vue {

    @State businesses
    @State activeStudentProfile
    @State deleteStudentBusinessId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }

        this.submitting = true

        const business = this.businesses.filter(d => {
            return d.id === this.deleteStudentBusinessId
        }).pop()

        store.dispatch('removeStudentFromBusiness', {
            studentId: this.activeStudentProfile.id,
            businessId: this.deleteStudentBusinessId,
            businessName: business.name
        }).then(() => {
            this.submitting = false
            this.toggleModal('removeStudentBusiness')
        })
    }
}
