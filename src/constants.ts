export const BASE_URL: string = window.location.host === 'localhost:8080'
    ? 'http://localhost:5000'
    : window.location.origin

export const PUSHER = {
    KEY: 'b924d093081d30cbca17',
    CLUSTER: 'ap2'
}
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51HBFo0Jq9lBFiVSrT5hW9cVcLxg27woSSTuXhgAMKstqRE1Fm7zXuuULe0TeRsQNpd1qsVZyXw3u2mmRLpVunO5J00ZfuCq7WY'
// export const STRIPE_PUBLISHABLE_KEY = 'pk_live_AAGCNw5v2LHWOE0Lc5eHAAsa'
