import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { ProgressBar } from '../../shared/ProgressBar'
import { Breadcrumbs } from '../Breadcrumbs'

import './StudentProfile.scss'
import '../Filters/Filters.scss'
import store from '../../../store'

@Component({
    template: require('./StudentProfile.html'),
    name: 'StudentProfile',
    components: {
        ProgressBar,
        Breadcrumbs,
    }
})
export class StudentProfile extends Vue {

    @State breadcrumbs
    @State activeStudentProfile
    @State courses
    @State businesses

    @Inject() toggleModal

    loaded = false

    get studentActivity() {
        const activity = this.activeStudentProfile.activity || []
        return activity.sort((a, b) => b.updatedAt - a.updatedAt)
    }

    @Watch('activeStudentProfile', { deep: true})
    watchStudentProfile(newVal, oldVal) {
        if (newVal) {
            this.loaded = true
        }
    }

    mounted() {
        const { params } = this.$route
        store.dispatch('getStudentProfile', parseInt(params.studentId))
    }

    confirmRemoveCourse(courseId) {
        store.commit('setDeleteStudentCourseId', courseId)
        this.toggleModal('removeStudentCourse')
    }

    confirmRemoveBusiness(businessId) {
        store.commit('setDeleteStudentBusinessId', businessId)
        this.toggleModal('removeStudentBusiness')
    }

}
