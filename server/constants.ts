import app from "./app";

export const PASSWORD_OPTS = {
  uppercase: false,
  numbers: true,
  excludeSimilarCharacters: true
};

export const SALT_ROUNDS = 10;

export const PORT = process.env.PORT || 5000;

export const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-2"
};

export const S3_BUCKET = "grow2-s31";

export const UPLOAD_DIRECTORY = "./uploads";

export const JWT_ISSUER = "stagegrow.herokuapp.com";

export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
};

export const STRIPE_SECRET = process.env.STRIPE_SECRET;

export const PUSHER = new (require("pusher"))({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: process.env.PUSHER_USE_TLS
});
