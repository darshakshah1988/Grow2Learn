import { Component, Vue } from 'vue-property-decorator'

import { Card } from '../Card'
import { Modal } from '../Modal'
import { Header } from '../Header'
import { ProgressBar } from '../ProgressBar'
import { CourseMenu } from '../../admin/CourseMenu'
import { QuizBuilder } from '../../admin/QuizBuilder'

import './styleguide.scss'

@Component({
    template: require('./styleguide.html'),
    components: {
        Card,
        Modal,
        Header,
        CourseMenu,
        ProgressBar,
        QuizBuilder
    }
})

export class StyleguideComponent extends Vue {
    showModal =  false

    menuExample = [
        {
            text: 'Link one',
            link: '',
            active: true
        },
        {
            text: 'Link two',
            link: '',
            active: false
        },
        {
            text: 'Link three',
            link: '',
            active: false
        }
    ]

}
