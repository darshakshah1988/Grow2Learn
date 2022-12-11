import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveVideo.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveVideo.html'),
    name: 'RemoveVideo',
    components: {}
})

export class RemoveVideo extends Vue {

    @State removeVideoCardId

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
        store.dispatch('removeCardVideo', payload)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeVideo')
                store.dispatch('getStorageUsage')
            })
    }
}
