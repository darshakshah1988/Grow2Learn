import { Component, Prop, Vue, Provide } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { StudentService } from '../../../services'
const studentService = new StudentService()

import { StudentTile } from '../StudentTile'

import './StudentList.scss'
import store from '../../../store'

const crumbs = () => [
    {
        label: 'Your students',
        link: '/dashboard'
    }
]

const toggleModal = k => store.commit('toggleModal', k)

@Component({
    template: require('./StudentList.html'),
    name: 'StudentList',
    components: {
        StudentTile
    }
})

export class StudentList extends Vue {

    @Provide() toggleModal = toggleModal

    @Getter registeredStudents
    @Getter pendingStudents
    @State studentListFilter
    @State route
    @State dashboardLoading

    @Prop({ default: crumbs }) breadcrumbs: any[]

    setStudentListFilter(view) {
        store.commit('setStudentListFilter', view)
    }

    mounted() {
        store.commit('setBreadcrumbs', [
            {
                label: 'Members'
            }
        ])
    }
}
