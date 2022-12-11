
import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './AddCard.scss'
import store from '../../../store'
import axios from 'axios'

@Component({
    template: require('./AddCard.html'),
    name: 'AddCard',
    components: {
    }
})

export class AddCard extends Vue {
    @Inject() toggleModal
    @Inject() unitService

    @State activeUnit
    @State route
    @State modals
    @State addCardUnitId

    name = ''
    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('createCard', {
            courseId: parseInt(this.$route.params.courseId),
            unitId: parseInt(this.addCardUnitId),
            name: this.name,
        }).then(d => {
            this.name = ''
            this.submitting = false
            this.toggleModal('card')
        })
    }
}

