import axios from 'axios'

import { BASE_URL } from '../constants'

export class StudentService {
    getAll() {
        return axios.get(BASE_URL + '/students')
            .then(res => {
                return res.data
            })
    }
    invite(name, email, businessIds) {
        return axios.post(BASE_URL + '/admin/student', {
            name,
            email,
            businessIds
        })
    }
}
