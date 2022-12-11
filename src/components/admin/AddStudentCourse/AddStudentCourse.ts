import { Component, Prop, Vue, Inject } from 'vue-property-decorator'

import './AddStudentCourse.scss'
import { State } from 'vuex-class'
import store from '../../../store'

@Component({
    template: require('./AddStudentCourse.html'),
    name: 'AddStudentCourse',
    components: {}
})

export class AddStudentCourse extends Vue {
    @Inject() toggleModal

    @State courses
    @State activeStudentProfile

    courseIds = []

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true

        store.dispatch('addStudentCourse', {
            studentId: this.activeStudentProfile.id,
            courseIds: this.courseIds,
            courseNames: this.courseIds.map(id => {
                const course = this.courses.filter(d => d.id === id).pop()
                return course ? course.name : '?'
            })
        }).then(course => {
            this.courseIds = []
            this.submitting = false
            this.toggleModal('addStudentCourse')
        })
    }
}
