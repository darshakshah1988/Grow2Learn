import * as AWS from 'aws-sdk'
import { AWS_CONFIG, S3_BUCKET } from './constants'
AWS.config.update(AWS_CONFIG)

export const s3 = new AWS.S3()

export const getSignedUrl = (filename) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: S3_BUCKET,
      Key: filename,
      Expires: 600,
    }
    s3.getSignedUrl('getObject', params, (err, data) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(data)
      }
    })
  })
}

export const createPresignedPost: any = (filename) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: S3_BUCKET,
      // Key: filename,
      Fields: {
        key: filename,
      },
      Expires: 600,
    }
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        console.log(err)
        return reject(err)
      } else {
        return resolve(data)
      }
    })
  })
}

const listBuckets = () => {
  s3.listBuckets((err, data) => {
    console.log(err || data)
  })
}
