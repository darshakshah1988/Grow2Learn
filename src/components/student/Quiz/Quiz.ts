import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import store from '../../../store'

import './Quiz.scss'

@Component({
    template: require('./Quiz.html'),
    name: 'Quiz',
    components: {}
})

export class Quiz extends Vue {
    @Prop() questions: any[]
    @Prop() nextCardId: number
    @Prop() hasTask: boolean

    @State route

    currentQuestion = 1
    clicked = null
    passed = true
    review = false
    incorrect = 0

    get correct() {
        return this.questions.length - this.incorrect
    }

    submitAnswer(qIndex, aIndex) {
        this.clicked = aIndex
        if (!this.questions[qIndex].answers[aIndex].correct) {
            this.incorrect++
            this.passed = false
        }
        setTimeout(() => {
            if (this.currentQuestion === this.questions.length) {
                // this.$emit('finish')
                this.currentQuestion = 1
                this.clicked = null
                if (!this.review) {
                    store.dispatch('submitStudentCard', this.passed)
                    this.review = true
                }
            } else {
                this.currentQuestion++
                this.clicked = null
            }
        }, 1000)
    }

    reset() {
        this.incorrect = 0
        this.review = false
        this.passed = true
    }

    finishCard() {
        this.reset()
        this.$router.push({ name: 'studentCard', params: { courseId: this.route.params.courseId, unitId: this.route.params.unitId, cardId: this.nextCardId + ''}})
    }

    finishUnit() {
        this.reset()
        this.$router.push({ name: 'studentCourse', params: { courseId: this.route.params.courseId }})
    }

    close() {
        this.reset()
        this.$emit('close')
    }

    showTask() {
        this.$emit('showTask')
    }

}
