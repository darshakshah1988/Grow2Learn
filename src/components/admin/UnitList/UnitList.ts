import { Component, Prop, Watch, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import { SlickList, SlickItem } from 'vue-slicksort'
import * as moment from 'moment'
import { UnitService } from '../../../services'
const unitService = new UnitService()

import './UnitList.scss'

import store from '../../../store'

const toggleModal = k => store.commit('toggleModal', k)

@Component({
    template: require('./UnitList.html'),
    name: 'UnitList',
    components: {
        SlickList,
        SlickItem,
    }
})

export class UnitList extends Vue {
    @Inject() toggleModal

    @Prop() name: string
    @Prop() unitId: number

    @Getter currentCourse

    @State route
    @State addCardUnitId

    $refs: {
        textarea: HTMLTextAreaElement
    }

    cardName = ''
    unit = null
    loading = false
    editing = false
    addingCard = false
    menuOpen = false

    cards = []

    @Watch('menuOpen')
    watchMenuOpen(newVal, oldVal) {
        if (newVal) {
            document.addEventListener('click', this.toggleMenu)
        } else {
            document.removeEventListener('click', this.toggleMenu)
        }
    }

    addCard() {
        this.cardName = ''
        this.addingCard = true
        document.body.addEventListener('click', (e) => {
            alert('test')
            this.addingCard = false
        })
        store.commit('set', {
            key: 'addCardUnitId',
            value: this.unitId,
        })
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen
    }
    cardType(){
        store.commit('set', {
            key: 'addCardUnitId',
            value: this.unitId,
        })
        toggleModal('cardType')
    }
    format_date(card){
        //console.log(card);
        
        if (card.cardType === 'meeting') {
          return moment(String(card.name)).format('Do MMM YYYY')
        }else{
            return card.name
        }
     }

    removeUnit() {
        store.commit('set', {
            key: 'removeUnitId',
            value: this.unitId
        })
        this.toggleModal('removeUnit')
        this.toggleMenu()
    }

    blur() {
        this.addingCard = false
    }

    edit() {
        this.editing = true
        this.$nextTick(() => {
            this.$refs.textarea.focus()
            this.$refs.textarea.select()
        })
    }

    handleKeypress(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.editing = false
            this.save()
        }
    }

    save() {
        this.name = this.$refs.textarea.value // eagerly update local name for label only
        store.dispatch('editUnitName', {
            courseId: parseInt(this.route.params.courseId),
            unitId: this.unitId,
            name: this.$refs.textarea.value,
        })
    }

    submit() {
        store.dispatch('createCard', {
            courseId: parseInt(this.route.params.courseId),
            unitId: this.addCardUnitId,
            name: this.cardName,
        }).then(card => {
            this.cardName = ''
            this.addingCard = false
            // Hack attack
            const exists = this.cards.filter(d => d.id === card.id).length === 1
            if (!exists) {
                this.cards.push(card)
            }
            this.sortCards(this.cards)
        })
    }

    mounted() {
        const { params } = this.$route

        this.loading = true
        unitService.get(this.unitId).then(unit => {
            const courseId = parseInt(this.route.params.courseId)
            this.unit = unit
            this.loading = false
            store.commit('setUnitInCourse', { unit, courseId })
            if (this.unit.sortOrder) {
                const sortOrder = JSON.parse(this.unit.sortOrder)
                this.cards = this.unit.cards.sort((a, b) => {
                    return sortOrder.findIndex(d => d === a.id) - sortOrder.findIndex(d => d === b.id)
                })
            } else {
                this.cards = this.unit.cards
            }
        })
        console.log(this.currentCourse);
        
        if(this.currentCourse.sponsors && this.currentCourse.sponsors.length() > 0){

            document.getElementById('addSponsorbtn').innerHTML = '<i class="fal fa-trash-alt"></i> Edit Sponsor'
        }
    }

    sortCards(cards) {
        const sortOrder = cards.map(card => card.id)
        this.unit.sortOrder = JSON.stringify(sortOrder)
        store.dispatch('editUnitSortOrder', {
            courseId: parseInt(this.route.params.courseId),
            unitId: this.unitId,
            sortOrder: this.unit.sortOrder,
        })
    }
}
