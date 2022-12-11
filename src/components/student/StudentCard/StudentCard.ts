import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import store from '../../../store'

import { Quiz } from '../Quiz'
import { Task } from '../Task'

import './StudentCard.scss'

@Component({
    template: require('./StudentCard.html'),
    name: 'StudentCard',
    components: {
        Quiz,
        Task
    }
})

export class StudentCard extends Vue {
    @State activeStudentCard
    @State student

    quizVisible = false
    taskVisible = false

    $refs: {
        video: HTMLVideoElement
        youtube: HTMLIFrameElement
    }

    get parsedQuestions() {
        return this.activeStudentCard.quiz ? JSON.parse(this.activeStudentCard.quiz) : []
    }

    get parsedAttendees() {
        return this.activeStudentCard.attendees ? JSON.parse(this.activeStudentCard.attendees) : [];
    }
    get parsedAgenda() {
        return this.activeStudentCard.agendaActions ? JSON.parse(this.activeStudentCard.agendaActions) : [];
    }

    showQuiz() {
        this.quizVisible = true
    }

    hideQuiz() {
        this.quizVisible = false
    }

    showTask() {
        this.taskVisible = true
    }

    hideTask() {
        this.taskVisible = false
    }

    handleContextMenu(e) {
        e.preventDefault()
    }

    handleFinish() {
    // If its the last card and there is another unit to go
        const courseId = parseInt(this.$route.params.courseId)
        const unitId = parseInt(this.$route.params.unitId)
        const cardId = parseInt(this.$route.params.cardId)

        const courseIndex = this.student.courses.findIndex(course => course.id === courseId)
        const unitIndex = this.student.courses[courseIndex].units.findIndex(unit => unit.id === unitId)

        const course = this.student.courses[courseIndex]
        const unit = this.student.courses[courseIndex].units[unitIndex]
        if (!this.activeStudentCard.nextCardId && this.activeStudentCard.nextUnitId) {
            store.dispatch('adminCreateStudentActivity', {
                studentId: store.state.student.id,
                text: `has completed ${unit.name}`
            })
            // otherwise if its the last unit aka end of course
        } else {
            store.dispatch('adminCreateStudentActivity', {
                studentId: store.state.student.id,
                text: `has completed ${course.name}`
            })
        }
    }

    @Watch('$route', { deep: true })
    watchRoute(newVal, oldVal) {
        this.updateRoute(newVal)
    }

    @Watch('activeStudentCard',{deep:true})
    watchActiveStudentCard(newVal, oldVal) {
        if (newVal && newVal.videoId) {
            this.$nextTick(() => {
                console.log("video");
                
                this.updateFileSrc("video")
            })
        }
    }

    mounted() {
        this.updateRoute(this.$route)
    }

    updateRoute(route) {
        const { params } = route
        store.dispatch('getStudentCard', {
            courseId: parseInt(params.courseId),
            unitId: parseInt(params.unitId),
            cardId: parseInt(params.cardId)
        })
        this.quizVisible = false
        this.taskVisible = false
    }

    nextCard() {
        store.dispatch('submitStudentCard', true).then(() => {
            if (this.activeStudentCard.nextCardId) {
                this.$router.push({
                    name: 'studentCard',
                    params: {
                        courseId: this.$route.params.courseId,
                        unitId: this.$route.params.unitId,
                        cardId: this.activeStudentCard.nextCardId
                    }
                })
            } else {
                // Next Unit
                // this.$router.push({ name: 'studentHome' })

                if (this.activeStudentCard.nextUnitId) {
                    this.$router.push({
                        name: 'studentUnit', params: {
                            courseId: this.$route.params.courseId,
                            unitId: this.activeStudentCard.nextUnitId
                        }
                    })
                } else {

                    this.$router.push({
                        name: 'studentCourse', params: {
                            courseId: this.$route.params.courseId
                        }
                    })
                }
            }
        })
    }

    updateFileSrc(format) {
        store.dispatch('getStudentFileUrl', {
            cardId: this.activeStudentCard.id,
            format: format
        }).then(url => {
            switch (format) {
                case 'video':
                    this.$refs.video.setAttribute('src', url)
                break
                case 'youtube':
                    this.$refs.youtube.setAttribute('src', url)
                break
            }
        })
    }

}
