import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveStudentCourse.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveStudentCourse.html'),
    name: 'RemoveStudentCourse',
    components: {}
})

export class RemoveStudentCourse extends Vue {

    @State courses
    @State activeStudentProfile
    @State deleteStudentCourseId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }

        this.submitting = true

        const course = this.courses.filter(d => {
            return d.id === this.deleteStudentCourseId
        }).pop()

        store.dispatch('removeStudentFromCourse', {
            studentId: this.activeStudentProfile.id,
            courseId: this.deleteStudentCourseId,
            courseName: course.name
        }).then(() => {
            this.submitting = false
            this.toggleModal('removeStudentCourse')
        })
    }
}
