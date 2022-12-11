import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveBusinessCourse.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveBusinessCourse.html'),
    name: 'RemoveBusinessCourse',
    components: {}
})

export class RemoveBusinessCourse extends Vue {

    @State activeBusinessProfile
    @State removeBusinessCourseId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('removeCourseFromBusiness', {
            businessId: this.activeBusinessProfile.id,
            courseId: this.removeBusinessCourseId
        }).then(() => {
            this.submitting = false
            this.toggleModal('removeBusinessCourse')
        })
    }
}
