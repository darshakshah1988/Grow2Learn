import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './RemoveBusiness.scss'
import store from '../../../store'

@Component({
    template: require('./RemoveBusiness.html'),
    name: 'RemoveBusiness',
    components: {}
})

export class RemoveBusiness extends Vue {

    @State removeBusinessId

    @Inject() toggleModal

    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('removeBusiness', store.state.removeBusinessId)
            .then(() => {
                this.submitting = false
                this.toggleModal('removeBusiness')
                this.$router.push({ name: 'dashboard' })
            })
    }
}
