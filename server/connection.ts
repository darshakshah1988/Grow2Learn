import { Sequelize } from 'sequelize-typescript'
import * as parse from 'parse-database-url'
import { Logger } from './logger'

const url = process.env.CLEARDB_DATABASE_URL
// mysql://bbe55d994903c1:1d60a06b@us-cdbr-east-02.cleardb.com/heroku_258d77d328d5358?reconnect=true
const config = url ? parse(url) : {
//   host: 'us-cdbr-east-02.cleardb.com',
//   user: 'bbe55d994903c1',
//   password: '1d60a06b',
//   database: 'heroku_258d77d328d5358',
    host: '2.57.89.1',
    user: 'u266860147_growroot',
    password: 'Grow2#2022',
    database: 'u266860147_grow2live',
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'G2',
}

// const config = url ? parse(url) : {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'headway',
// }
const { user, password, database, host } = config

Logger.debug(`Connecting to database @ ${host}`)

const connection = new Sequelize({
    database,
    host,
    username: user,
    password,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false,
    modelPaths: [__dirname + '/models/*.ts'],
    logging: false,
})

export default connection
