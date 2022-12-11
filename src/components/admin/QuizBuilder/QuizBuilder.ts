import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './QuizBuilder.scss'
import { Answer, Question } from '../../../interfaces'
import store from '../../../store'

import { reject } from 'lodash'

@Component({
    template: require('./QuizBuilder.html'),
    name: 'QuizBuilder',
    components: {}
})
export class QuizBuilder extends Vue {

    @Getter currentCard

    questions = []

    @Watch('currentCard', { deep: true })
    watchCurrentCard(newVal, oldVal) {
        if (newVal && newVal.quiz) {
            this.questions = JSON.parse(newVal.quiz)
        }
    }

    addQuestion() {
        const question: Question = {
            question: '',
            answers: [
                {
                    text: '',
                    correct: true,
                }
            ]
        }
        this.questions.push(question)
        this.$nextTick(() => {
            document.getElementById('question-' + (this.questions.length - 1)).focus()
            document.getElementById('question-' + (this.questions.length - 1)).scrollIntoView(true)
        })
    }

    removeQuestion(qIndex) {
        this.questions = this.questions.filter((question, i) => i !== qIndex)
        // Shouldnt need to set this
        this.save()
    }

    addAnswer(qIndex) {
        const totalAnswers = this.questions[qIndex].answers.length + 1
        const answer: Answer = {
            text: '',
            correct: false
        }
        this.questions[qIndex].answers.push(answer)
        this.$nextTick(() => {
            document.getElementById('answer-' + qIndex + '-' + (this.questions[qIndex].answers.length - 1)).focus()
            document.getElementById('answer-' + qIndex + '-' + (this.questions[qIndex].answers.length - 1)).scrollIntoView(true)
        })
    }

    removeAnswer(qIndex, aIndex) {
        this.questions[qIndex].answers = this.questions[qIndex].answers.filter((answer, i) => i !== aIndex)
        this.save()
    }

    save() {
        const filledQuestions = this.questions.filter(question => {
            return question.question.length
        })
        store.dispatch('updateActiveCardQuiz', filledQuestions)
    }

    mounted() {
        if (this.currentCard && this.currentCard.quiz) {
            this.questions = JSON.parse(this.currentCard.quiz)
        }
    }
}
