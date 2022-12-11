import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveAudio.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveAudio.html'),
    name: 'RemoveAudio',
    components: {}
})

export class RemoveAudio extends Vue {

    @State removeAudioCardId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        const payload = {
            courseId: parseInt(this.$route.params.courseId),
            unitId: parseInt(this.$route.params.unitId),
            cardId: parseInt(this.$route.params.cardId),
        }
        store.dispatch('removeCardAudio', payload)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeAudio')
                store.dispatch('getStorageUsage')
            })
    }
}
