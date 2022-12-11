import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveCourse.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveCourse.html'),
    name: 'RemoveCourse',
    components: {}
})

export class RemoveCourse extends Vue {

    @State removeCourseId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('removeCourse', this.removeCourseId)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeCourse')
                this.$router.push({ name: 'dashboard' })
            })
    }
}
