import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './AddCourse.scss'
import store from '../../../store'
import axios from 'axios'

@Component({
    template: require('./AddCourse.html'),
    name: 'AddCourse',
    components: {
    }
})

export class AddCourse extends Vue {
    @State businesses
    @State modals

    name = ''
    businessIds = []
    submitting = false
    selection = [];
    checkCount = 0;

        
    checkUncheck(e) {
            if(this.selection.indexOf(e) !== -1)  
            {  
                let index = this.selection.indexOf(e);
                this.selection.splice(index, 1);  
            }   
            else  
            {  
                this.selection.push(e);  
            }
            
    }

    submit() {
        
        if (this.submitting) {
            return
        }
        this.submitting = true

        store.dispatch('createCourse', {
            name: this.name,
            businessIds: this.businessIds,
            checkCount: this.selection.length
        }).then(course => {
            this.$router.push({
                path: '/c/' + course.id,
            })
        }).then(d => {
            this.$ua.trackEvent('course', 'create', this.name)
            this.name = ''
            this.submitting = false
            this.$emit('close')
        })
    }
}
