import axios from 'axios'

import { BASE_URL } from '../constants'

export class BusinessService {
    getAll() {
        return axios.get(BASE_URL + '/businesses')
            .then(res => {
                return res.data
            })
    }
}
