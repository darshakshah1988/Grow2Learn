import { Component, Prop, Vue, Inject } from 'vue-property-decorator'

import './CourseMenu.scss'

import store from '../../../store'

@Component({
    template: require('./CourseMenu.html'),
    name: 'CourseMenu'
})
export class CourseMenu extends Vue {
    @Prop() items: any[]
    @Prop() icon: string
    @Prop() collection: string
    @Inject() toggleModal

    linkClass(active) {
        return {
            'CourseMenu__link': true,
            'CourseMenu__link--active': active
        }
    }
}
