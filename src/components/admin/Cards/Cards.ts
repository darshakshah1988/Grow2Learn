import { Component, Prop, Watch, Vue, Inject } from 'vue-property-decorator'

import './Cards.scss'
import store from '../../../store'

@Component({
    template: require('./Cards.html'),
    name: 'Cards',
    components: {}
})

export class Cards extends Vue {
    @Inject() toggleModal
    @Prop() cards: any[]

    get courseId() {
        return this.$route.params.courseId
    }

    get unitId() {
        return this.$route.params.unitId
    }

    removeUnit() {
        store.commit('set', {
            key: 'removeUnitId',
            value: this.$route.params.unitId
        })
        this.toggleModal('removeUnit')
    }
}
