import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveCard.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveCard.html'),
    name: 'RemoveCard',
    components: {}
})

export class RemoveCard extends Vue {

    @State removeCardId
    @State route

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('removeCard', this.removeCardId)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeCard')
                this.$router.push({ name: 'course', params: { courseId: this.route.params.courseId } })
            })
    }
}
