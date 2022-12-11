import { BASE_URL } from './../../../constants';

import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator'
import { state } from './../../../state';
import { State, Getter, Mutation } from 'vuex-class'
import store from '../../../store'

import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

import './MeetingCard.scss'

@Component({
    template: require('./MeetingCard.html'),
    name: 'MeetingCard',
    components: {
        DatePicker,
    }
})

export class MeetingCard extends Vue {
    @Inject() toggleModal

    @State modals
    @State addCardUnitId
    
    date = ''
    time = ''
    timeSlots = []
    submitting = false
    mounted() {
        for (let hr = 0; hr < 24; hr++) {
            const H = hr;
            const h = (H % 12) || 12;
            const ampm = H < 12 ? "AM" : "PM";
            const hrStr = h.toString().padStart(2, "0") + ":";
            let val = hrStr + "00"+ampm;
            this.timeSlots.push(val);
            
            val = hrStr + "30"+ampm;
            this.timeSlots.push(val);
          }
    }

    submit(){
        if (this.submitting) {
            return
        }
        store.dispatch('createMeetingCard', {
            courseId: parseInt(this.$route.params.courseId),
            unitId: parseInt(this.addCardUnitId),
            name: this.date,
            time: this.time,
            cardType:'meeting'
        }).then(d => {
            this.$router.push({ name: 'card',params: { courseId: this.$route.params.courseId, unitId: this.addCardUnitId, cardId: d.id } })
            this.toggleModal('meetingCard')
        })
    }
    disabledBeforeDates(date){
        const today = new Date();
        today.setHours(0, 0, 0, 0);

      return date < today;
    }
    cancelform() {
        console.log("Backdrop clicked");
    }
}
