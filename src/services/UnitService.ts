import axios from 'axios'

import { BASE_URL } from '../constants'

export class UnitService {
    get(id) {
        return axios.get(BASE_URL + '/admin/unit/' + id)
            .then(res => {
                return res.data
            })
    }
}
