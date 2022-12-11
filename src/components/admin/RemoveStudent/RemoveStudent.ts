import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveStudent.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveStudent.html'),
    name: 'RemoveStudent',
    components: {}
})

export class RemoveStudent extends Vue {

    @State removeStudentId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('removeStudent', store.state.removeStudentId)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeStudent')
                this.$router.push({ name: 'dashboard' })
            })
    }
}
