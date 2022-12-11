import * as jwt from "jsonwebtoken";
import * as passwordGenerator from "generate-password";

import app from "../app";
import { createAdmin } from "../actions";
import { PASSWORD_OPTS, JWT_ISSUER, STRIPE_SECRET } from "../constants";
import {
  authAdmin,
  authStudent,
  authAdminInvite,
  hashPassword,
  authMentorInvite
} from "../authentication";
import mailer from "../mailer";
import mail from "../mail";

import {
  Business,
  Card,
  Course,
  Mentor,
  Student,
  Unit,
  Admin,
  BusinessStudent,
  BusinessCourse,
  CourseStudent,
  Activity
} from "../models";
const base_url = process.env.URL;
const SERVER_STARTUP = new Date();

const stripe = require("stripe")(STRIPE_SECRET);

const slack = require("slack-notify")(process.env.MY_SLACK_WEBHOOK_URL);

app.get("/status", (req, res) => {
  res.send(`<pre>Server started ${SERVER_STARTUP.toLocaleString()}`);
});

app.get("/user", (req, res) => {
  res.send(req.user);
});

app.get("/logout", (req, res) => {
  console.log(req, res);
  req.logout();
  res.redirect("/");
});

app.post("/login/admin", authAdmin, (req, res) => {
  res.send(req.user);
});

app.post("/register", (req, res) => {
  const password: string = passwordGenerator.generate(PASSWORD_OPTS);
  const data = {
    name: req.body.name,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password
  };
  createAdmin(data)
    .then(admin => {
      if (admin == null) {
        res.send({
          success: false,
          message: "This email is already registered. Please login"
        });
      } else {
        // Send confirmation email
        const token = jwt.sign(
          {
            sub: admin.id,
            name: admin.name,
            firstName: admin.first_name,
            lastName: admin.last_name,
            email: admin.email,
            iss: JWT_ISSUER,
            userType: "admin",
            aud: "invite"
          },
          process.env.JWT_SECRET
        );

        console.log("\n\n");
        console.log(base_url+"/confirm?token=" + token);
        console.log("\n\n");
        const created = new Date();
        const expired = new Date();
        expired.setDate(expired.getDate() + 60);

        const mailData = {
          token,
          name: data.name,
          first_name: admin.first_name,
          last_name:admin.last_name,
          email: admin.email,
          created: created,
          expired: expired
        };
        
        mailer.messages().send(
          {
            to: admin.email,
            from: mail.FROM,
            subject: mail.welcome.subject(admin.name),
            text: mail.welcome.text(mailData),
            html: mail.welcome.html(mailData)
          },
          (error, body) => {
            if (error) {
              console.error(error);
            }
          }
        );

        //Admin email 
        mailer.messages().send(
          {
            cc: "smartdarshak88@gmail.com",
            to: "contact@adminoh.com",
            from: mail.FROM,
            subject: "New Registration to Adminoh",
            text: mail.registration.text(mailData),
            html: mail.registration.html(mailData)
          },
          (error, body) => {
            if (error) {
              console.error(error);
            }
          }
        );

        stripe.customers.create(
          {
            email: admin.email,
            name: `${admin.first_name} ${admin.last_name}`,
            description: `Admin for ${admin.name} Club`
          },
          (err, customer) => {
            if (err) {
              console.warn(err);
            } else {
              stripe.subscriptions.create({
                customer: customer.id,
                items: [
                  {
                    price: "price_1JCMuRKPfGilLJKfplNEY1ir"
                  }
                ]
              });

              admin.stripe_cust_id = customer.id;
              return admin.save();
            }
          }
        );

        // slack.alert({
        // text: 'New Admin registration',
        // fields: {
        // 'Name': req.body.first_name + ' ' + req.body.last_name,
        // 'Email': admin.email,
        // 'Organisation': admin.name
        // }
        // })

        return Business.create({
          adminId: admin.id,
          name: admin.name
        }).then(business => {
          res.send({
            success: true,
            message:
              "Registration successfully done! Please check verification email for further process!"
          });
        });
      }
    })
    .catch(err => {
      console.warn(err);
      res.status(500).send({ message: "Could not register" });
    });
});

const sendPasswordResetEmail = user => {
  console.log("Send email to ", user.userType);
  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name || user.first_name,
      email: user.email,
      iss: JWT_ISSUER,
      userType: user.userType,
      aud: "invite" // WARNING: should be reset-password? sharing passport strategy though...
    },
    process.env.JWT_SECRET
  );

  console.log(base_url+"/reset-password?token=" + token);
  const mailData = {
    token
  };
  mailer.messages().send(
    {
      to: user.email,
      from: mail.FROM,
      subject: mail.resetPassword.subject,
      text: mail.resetPassword.text(mailData),
      html: mail.resetPassword.html(mailData)
    },
    (error, body) => {
      if (error) {
        console.warn(error);
      }
    }
  );
};

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  Admin.findOne({ where: { email } }).then(admin => {
    if (admin) {
      sendPasswordResetEmail(admin);
      res.send({ success: true, message: "Reset email sent" });
    } else {
      Student.findOne({ where: { email } }).then(student => {
        if (student) {
          sendPasswordResetEmail(student);
          res.send({ success: true, message: "Reset email sent" });
        } else {
          res.send({ success: false, message: "Account not found" });
        }
      });
    }
  });
});

app.get("/password-reset-failed", (req, res) => {
  res.send("Password Reset Failed");
});

app.put("/update-admin-details", authAdminInvite, (req, res) => {
  (async () => {
    const admin = await Admin.findByPk(req.user.id);
    const userData = req.body;
    const { password } = req.body;
    admin.password = await hashPassword(password);   
    await admin.save();
    res.send(admin);
  })();
});

app.put("/update-mentor-details", (req, res) => {
  (async () => {
    const admin = await Admin.findByPk(req.body.id);

    const { password, first_name, last_name } = req.body;
    admin.password = await hashPassword(password);
    admin.first_name = first_name;
    admin.last_name = last_name;
    await admin.save();
    res.send(admin);
  })();
});

app.post("/login/student", authStudent, (req, res) => {
  res.send(req.user);
});

app.post("/stripe/hook", (req, res, next) => {
  const { id, type, data } = req.body;
  console.log("stripe hook", id, type);
  res.sendStatus(200);
});
