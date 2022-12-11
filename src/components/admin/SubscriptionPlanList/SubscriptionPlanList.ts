import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './SubscriptionPlanList.scss'

import store from '../../../store'

import { STRIPE_PUBLISHABLE_KEY } from '../../../constants'
import {loadStripe} from '@stripe/stripe-js'
import { Logger } from '../../../logger'

@Component({
    template: require('./SubscriptionPlanList.html'),
    name: 'SubscriptionPlanList'
})

export class SubscriptionPlanList extends Vue {
    @State subscription_plans
    @State subscription
    @State admin

    successUrl = `${window.location.origin}/subscription-plans`
    cancelUrl = `${window.location.origin}/subscription-plans`
    publishableKey = STRIPE_PUBLISHABLE_KEY
    items = []

    get subscriptionPlanIndex() {
        return this.subscription_plans.findIndex(sp => sp.id === this.subscription.product.id)
    }

    redirectToCheckout(priceId) {
        store.dispatch('createCheckoutSession', {
            successUrl: this.successUrl,
            cancelUrl: this.cancelUrl,
            customer: this.admin.stripe_cust_id,
            priceId
        })
            .then(async (checkoutSession) => {
                const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY)

                stripe.redirectToCheckout({
                    sessionId: checkoutSession.id
                  })
                  .then(result => {
                    console.log('result', result)
                    if (result.error.message) {
                        Logger.error(result.error.message)
                    }
                  })
            })
    }

    requestDowngradePlan(downgradePlanName) {
        store.dispatch('sendDowngradeRequest', {
            downgradePlanName: downgradePlanName,
            currentPlanName: this.subscription.product.name
        })
            .then(response => {
                this.$notify({
                    group: 'admin_notifs',
                    title: response.title,
                    text: response.text,
                    duration: 10000
                })
            })
    }

    mounted() {
        store.dispatch('getSubscriptionPlans')
    }
}
