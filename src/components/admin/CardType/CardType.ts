import { BASE_URL } from './../../../constants';

import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator'
import { state } from './../../../state';
import { State, Getter, Mutation } from 'vuex-class'
import store from '../../../store'
import './CardType.scss'

@Component({
    template: require('./CardType.html'),
    name: 'CardType',
    components: {}
})

export class CardType extends Vue {
    @Inject() toggleModal

    @State modals
    @State addCardUnitId
    
    mounted() {

    }

    learningCard(){
        store.dispatch('createCard', {
            courseId: parseInt(this.$route.params.courseId),
            unitId: parseInt(this.addCardUnitId),
            name: '',
        }).then(d => {
            this.$router.push({ name: 'card',params: { courseId: this.$route.params.courseId, unitId: this.addCardUnitId, cardId: d.id } })
            this.toggleModal('cardType')
        })
    }

    meetingCard(){
        this.toggleModal('cardType')
        this.toggleModal('meetingCard')
    }
    upcoming(){
        alert('This feature under progress')
    }
    cancelform() {
        console.log("Backdrop clicked");
    }
}
