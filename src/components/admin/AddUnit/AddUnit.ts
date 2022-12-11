import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './AddUnit.scss'
import store from '../../../store'

@Component({
    template: require('./AddUnit.html'),
    name: 'AddUnit',
    components: {
    }
})

export class AddUnit extends Vue {

    @Inject() unitService
    @Inject() toggleModal

    @State route
    @State modals

    name = ''
    submitting = false

    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        store.dispatch('createUnit', {
            courseId: parseInt(this.route.params.courseId),
            name: this.name
        }).then(d => {
            this.name = ''
            this.submitting = false
            this.toggleModal('addUnit')
            this.$emit('unit-added')
        })
    }
}
