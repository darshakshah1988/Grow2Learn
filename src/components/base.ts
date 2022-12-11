import { Component, Prop, Vue } from 'vue-property-decorator'

import './MyComponent.scss'

@Component({
    template: require('./MyComponent.html'),
    name: 'MyComponent',
    components: {}
})

export class MyComponent extends Vue {
}
