import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { ProgressBar } from '../../shared/ProgressBar'

import store from '../../../store'

import './StudentCourse.scss'

@Component({
    template: require('./StudentCourse.html'),
    name: 'StudentCourse',
    components: {
        ProgressBar,
    }
})

export class StudentCourse extends Vue {
    @Getter activeStudentCourse
    @State student

    currentUnitIndex = 0

    @Watch('$route', { deep: true })
    watchRoute(newVal, oldVal) {
        this.updateRoute(newVal)
    }

    get sortedUnits() {
        if (!this.activeStudentCourse) {
            return []
        }
        if (this.activeStudentCourse.sortOrder) {
            const sortOrder = JSON.parse(this.activeStudentCourse.sortOrder)
            return this.activeStudentCourse.units.sort((a, b) => {
                return sortOrder.findIndex(d => d === a.id) - sortOrder.findIndex(d => d === b.id)
            })
        } else {
            return this.activeStudentCourse.units
        }
    }

    updateRoute(route) {
        if (this.activeStudentCourse && this.activeStudentCourse.units) {
            const unitId = parseInt(this.$route.params.unitId)
            const unitIndex = this.activeStudentCourse.units.findIndex(unit => unit.id === unitId)
            if (unitIndex !== -1) {
                this.currentUnitIndex = unitIndex
            }
        }
    }

    get courseId() {
        return this.$route.params.courseId
    }

    get course() {
        const id = parseInt(this.$route.params.courseId)
        const courseIndex = this.student.courses.findIndex(course => course.id === id)
        const course = this.student.courses[courseIndex]
        return course || {}
    }

    setCurrentUnitIndex(i) {
        this.currentUnitIndex = i
    }

    unitClass(unitIndex) {
        return {
            'StudentCourse__unit': true,
            'StudentCourse__unit--open': unitIndex === this.currentUnitIndex,
        }
    }

    cardClass(unit, cardIndex) {
        return {
            'StudentCourse__link': true,
            'StudentCourse__link--completed': cardIndex < unit.progress.completedLength,
            'StudentCourse__link--active': cardIndex === unit.progress.completedLength
        }
    }

    mounted() {
        store.dispatch('getStudentCourse', this.courseId).then(() => {

            console.log("Ds", this.$route);
            this.updateRoute(this.$route)
        })
    }
}
