import { Component, Prop, Vue, Inject } from 'vue-property-decorator'

import './AddBusinessCourse.scss'
import { State } from '../../../../node_modules/vuex-class'
import store from '../../../store'

@Component({
    template: require('./AddBusinessCourse.html'),
    name: 'AddBusinessCourse',
    components: {}
})

export class AddBusinessCourse extends Vue {
    @Inject() toggleModal

    @State courses
    @State activeBusinessProfile

    courseIds = []

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('addBusinessCourse', {
            businessId: this.activeBusinessProfile.id,
            courseIds: this.courseIds,
        }).then(course => {
            this.courseIds = []
            this.submitting = false
            this.toggleModal('addBusinessCourse')
        })
    }
}
