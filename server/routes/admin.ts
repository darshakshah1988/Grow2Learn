import { createCourse, inviteStudent } from "../actions";
import app from "../app";
import {
  checkAdminLogin,
  checkAdminPermission,
  mockAdminLogin
} from "../authentication";
import { Logger } from "../logger";
import {
  Admin,
  Business,
  BusinessCourse,
  Card,
  Course,
  CourseStudent,
  Student,
  Unit,
  BusinessStudent,
  Activity,
  Notification,
  File,
  Sponsor,
  Document
} from "../models";
import { getSignedUrl, createPresignedPost, s3 } from "../s3";
import {
  S3_BUCKET,
  UPLOAD_DIRECTORY,
  STRIPE_SECRET,
  PUSHER,
  JWT_ISSUER
} from "../constants";
import { get } from "lodash";
import mailer from "../mailer";
import mail from "../mail";
import * as jwt from "jsonwebtoken";
import { file_v1beta1, google } from "googleapis";
import { authorize, uploadVideo, removeVideo } from "../youtube";
import CourseSponsor from "../models/CourseSponsor";

const fs = require("fs");

const stripe = require("stripe")(STRIPE_SECRET);

if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY);
}

if (process.env.MOCK_AUTH) {
  Logger.warn("WARNING: Mock Admin Auth enabled for /admin and /api");
  app.use("/admin*", mockAdminLogin);
  app.use("/api*", mockAdminLogin);
} else {
  app.use("/admin*", checkAdminLogin);
}

// Overview

app.get("/admin", (req, res) => {
  const adminId = req.user.admin.id;
  Admin.findByPk(adminId, {
    include: [
      {
        model: Business,
        include: [Student.scope("public")]
      },
      {
        model: Course,
        include: [
          // Student.scope('public'),
          Unit
        ]
      }
    ]
  }).then(admin => {
    res.send(admin);
  });
});

app.get("/admin/subscription", (req, res) => {
  const adminId = req.user.admin.id;
  Admin.findByPk(adminId).then(admin => {
    if (admin.stripe_cust_id) {
      stripe.customers.retrieve(admin.stripe_cust_id, (err, customer) => {
        if (err) {
          Logger.error(err);
          return;
        }
        const status = get(customer, "subscriptions.data[0].status");
        admin.save();
        res.send(customer);
      });
    } else {
      res.send({ message: "No subscription data" });
    }
  });
});

app.get("/admin/subscription_product/:productId", (req, res) => {
  const { productId } = req.params;
  stripe.products.retrieve(productId, (err, product) => {
    if (err) {
      Logger.error(err);
      res.send(err);
      return;
    }
    res.send(product);
  });
});

app.post("/admin/checkout/session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    customer: req.body.customer,
    payment_method_types: ["card"],
    line_items: [
      {
        price: req.body.priceId,
        quantity: 1
      }
    ],
    mode: "subscription",
    success_url: `${req.body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: req.body.cancelUrl
  });
  res.send(session);
});

app.get("/admin/checkout/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  stripe.checkout.sessions.retrieve(sessionId, (err, session) => {
    if (err) {
      Logger.error(err);
      res.send(err);
      return;
    }
    res.send(session);
  });
});

app.delete("/admin/subscription/:subscriptionId", (req, res) => {
  const { subscriptionId } = req.params;

  stripe.subscriptions.del(subscriptionId, (err, subscription) => {
    if (err) {
      Logger.error(err);
      res.send(err);
      return;
    }
    Logger.info(`Subscription with id ${subscription.id} has been cancelled`);
    res.send(subscription);
  });
});

app.get("/admin/subscription_plans", async (req, res) => {
  const subscription_plans = [];
  for await (const product of stripe.products.list({ limit: 3 })) {
    const keys = Object.keys(product.metadata);
    const notFeatureKeys = [
      "price",
      "price_id",
      "storageLimit",
      "storageInBytes"
    ];
    const features = keys
      .filter(k => !notFeatureKeys.includes(k))
      .map(k => {
        return product.metadata[k];
      });
    product.price = product.metadata.price;
    product.price_id = product.metadata.price_id;
    product.features = features;
    delete product.metadata;
    subscription_plans.push(product);
  }
  res.send(subscription_plans);
});

app.post("/admin/subscription/downgrade", (req, res) => {
  const adminId = req.user.admin.id;
  Admin.findByPk(adminId).then(admin => {
    const mailData = {
      current_plan: req.body.currentPlanName,
      downgraded_plan: req.body.downgradePlanName,
      name: admin.name,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name
    };
    mailer.messages().send(
      {
        to: mail.TO,
        from: admin.name + " " + admin.email,
        subject: mail.downgrade.subject,
        text: mail.downgrade.text(mailData),
        html: mail.downgrade.html(mailData)
      },
      (error, body) => {
        if (error) {
          console.warn(error);
        }
        res.send({
          title: `Your downgrade request to ${req.body.downgradePlanName} has been sent`,
          text: "The support team will contact you in 24 hours."
        });
      }
    );
  });
});

app.post("/admin/subscription", (req, res) => {
  const adminId = req.user.admin.id;
  const { token } = req.body;
  Admin.findByPk(adminId).then(admin => {
    if (admin.stripe_cust_id) {
      stripe.customers.retrieve(admin.stripe_cust_id, (err, customer) => {
        const subscription_id = get(customer, "subscriptions.data[0].id");
        console.log("Updating trial end:", subscription_id);
        stripe.subscriptions
          .update(subscription_id, {
            trial_end: "now"
          })
          .then(() => {
            console.log("OK");
          });
      });

      stripe.customers
        .update(admin.stripe_cust_id, {
          source: token
        })
        .then(() => {
          res.send("OK");
        });
    } else {
      res.send({ message: "No subscription data" });
    }
  });
});

// Courses

app.get("/admin/course", (req, res) => {
  Admin.findByPk(req.user.admin.id, {
    include: [{ model: Course, include: [Unit] }]
  }).then(admin => {
    res.send(admin.courses);
  });
});

app.post("/admin/course", (req, res) => {
  const { name, businessIds = [], checkCount } = req.body;
  Admin.findByPk(req.user.admin.id, { include: [Business] }).then(admin => {
    const ids = admin.businesses.map(d => d.id);
    for (const id of businessIds) {
      if (ids.indexOf(id) === -1) {
        res.status(401).send({
          message: "Unauthorized: Admin does not own Business #" + id
        });
        return;
      }
    }
    
    createCourse(req.user.admin.id, name, businessIds).then(course => {
      if(checkCount > 0)
      {
        const token = jwt.sign(
          {
            name: req.user.admin.name
          },
          process.env.JWT_SECRET
        );
        const mailData = {
          token,
          first_name: req.user.admin.first_name,
          last_name: req.user.admin.last_name,
          email: req.user.admin.email,
          admin_name: req.user.admin.name
        };
        mailer.messages().send(
          {
            to: req.user.admin.email,
            bcc:"smartdarshak88@gmail.com",
            from: mail.FROM,
            subject: "[Notification] Course Assigned on Grow2Learn.",
            text: mail.inviteCourse.text(mailData),
            html: mail.inviteCourse.html(mailData)
          },
          (error, body) => {
            if (error) {
              console.error(error);
            }
          });
      }
      res.send(course);
    });
    
  });
});

app.get("/admin/course/:courseId", checkAdminPermission, (req, res) => {
  Course.findByPk(req.params.courseId, {
    include: [Student, Business, Unit, Sponsor]
  }).then(course => {
    res.send(course);
  });
});

// Units

app.post("/admin/unit", checkAdminPermission, (req, res) => {
  const { name, courseId } = req.body;
  Unit.create({ name, courseId }).then(unit => {
    res.send(unit);
  });
});

app.get("/admin/unit/:unitId", (req, res) => {
  const { unitId } = req.params;
  Unit.findByPk(unitId, {
    include: [
      {
        model: Card
      },
      Course
    ]
  }).then(unit => {
    if (unit && unit.course.adminId === req.user.admin.id) {
      res.send(unit);
    } else {
      res
        .status(401)
        .send({ message: "Unauthorized: Admin does not own Unit #" + unitId });
    }
  });
});

// Cards

app.post("/admin/unit/:unitId/card", (req, res) => {
  const { unitId, name } = req.body;
  Unit.findByPk(unitId, { include: [Course] }).then(unit => {
    if (unit.course.adminId === req.user.admin.id) {
      Card.create({ unitId, name }).then(card => {
        res.send(card);
      });
    } else {
      res
        .status(401)
        .send({ message: "Unauthorized: Admin does not own Unit #" + unitId });
    }
  });
});

app.post("/admin/unit/:unitId/meetingcard", (req, res) => {
  const { unitId, name, cardType, time } = req.body;
  Unit.findByPk(unitId, { include: [Course] }).then(unit => {
    if (unit.course.adminId === req.user.admin.id) {
      Card.create({ unitId, name, cardType, time }).then(card => {
        res.send(card);
      });
    } else {
      res
        .status(401)
        .send({ message: "Unauthorized: Admin does not own Unit #" + unitId });
    }
  });
});

app.get("/admin/storage/size", (req, res) => {
  Course.findAll({
    where: { adminId: req.user.admin.id },
    include: [
      {
        model: Unit,
        include: [
          {
            model: Card
          }
        ]
      }
    ]
  }).then(courses => {
    const bytes = 0;

    courses.forEach(course => {
      course.units.forEach(unit => {
        unit.cards.forEach(card => {
          if (card.mediaId) {
            //bytes += card.mediaId.size
          }
          if (card.audioId) {
            //bytes += card.audioId.size
          }
          if (card.videoId) {
            //bytes += card.videoId.size
          }
        });
      });
    });
    let storageUsageSize = "";
    // if (bytes >= 1073741824) {
    //   storageUsageSize = `${(bytes / 1073741824).toFixed(2)} GB`
    // } else if (bytes >= 1048576) {
    //   storageUsageSize = `${(bytes / 1048576).toFixed(2)} MB`
    // } else if (bytes >= 1024) {
    //   storageUsageSize = `${(bytes / 1024).toFixed(2)} KB`
    // } else if (bytes > 1) {
    //   storageUsageSize = `${bytes} bytes`
    // } else if (bytes == 1) {
    //   storageUsageSize = `${bytes} byte`
    // } else {
    storageUsageSize = "0 bytes";
    //}
    res.send({ size: storageUsageSize, sizeInBytes: bytes });
  });
});

app.post("/admin/upload-logo", (req, res) => {
  const { file } = req.files;
  const Key = "logos/" + req.user.admin.id + "-" + file.name;
  const params = {
    Bucket: S3_BUCKET,
    Key,
    Body: file.data,
    ACL: "public-read"
  };
  s3.putObject(params, err => {
    (async () => {
      const admin = await Admin.findById(req.user.admin.id);
      admin.logo_url = Key;
      await admin.save();
      res.send(Key);
    })();
  });
});

app.post(
  "/admin/assign-courses-to-students",
  checkAdminPermission,
  (req, res) => {
    const { courseIds = [], studentIds = [], courseNames } = req.body;
    createCourseStudents(
      studentIds,
      courseIds,
      courseNames,
      req.user.admin.id
    ).then(d => {
      const token = jwt.sign(
        {
          name: req.user.admin.name
        },
        process.env.JWT_SECRET
      );
      const mailData = {
        token,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        admin_name: req.user.admin.name
      };
      mailer.messages().send(
        {
          to: req.user.email,
          bcc:"smartdarshak88@gmail.com",
          from: mail.FROM,
          subject: "[Notification] Course Assigned on Grow2Learn.",
          text: mail.inviteCourse.text(mailData),
          html: mail.inviteCourse.html(mailData)
        },
        (error, body) => {
          if (error) {
            console.error(error);
          }
        });
      res.send("OK");
    });
    
  }
);
app.post("/admin/document/upload", (req, res) => {
  const { docs } = req.files;
  const { businessId, type } = req.body;
  const Key = "doc/" + businessId + "-" + docs.name;
  const params = {
    Bucket: S3_BUCKET,
    Key,
    Body: docs.data,
    ACL: "public-read"
  };
  s3.putObject(params, err => {
    (async () => {
      // const admin = await Admin.findById(req.user.admin.id);
      // admin.logo_url = Key;
      // await admin.save();
      Document.create({ file: Key, businessId: businessId, type });
      res.send(Key);
    })();
  });
});
app.get("/admin/document/:businessId", (req, res) => {
  const { businessId } = req.params;
  Document.findAll({ where: { businessId } }).then(docs => {
    res.send(docs.reverse());
  });
});
app.delete("/admin/document/:id", (req, res) => {
  const { id } = req.params;
  Document.findById(id).then(docs => {
    const Key = docs.file;
    const params = {
      Bucket: S3_BUCKET,
      Key
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.warn(err);
      }
    });
    docs.destroy();
    res.send("OK");
  });
});
app.post("/admin/upload/:format", (req, res) => {
  const { format } = req.params;
  const { cardId } = req.body;
  const { file } = req.files;
  console.log(file);
  Card.findById(cardId, { include: [{ model: Unit, include: [Course] }] }).then(
    card => {
      if (card && card.unit.course.adminId === req.user.admin.id) {
        const Key = card.id + "/" + file.name;
        const params = {
          Bucket: S3_BUCKET,
          Key,
          Body: file.data
        };
        s3.putObject(params, err => {
          if (err) {
            Logger.error(`Failed to upload file to ${S3_BUCKET}/${Key}`);
          } else {
            if (format === "video") {
              card.videoId = file.name;
            } else if (format === "audio") {
              card.audioId = file.name;
            } else {
              card.mediaId = file.name;
            }
            card.save();
            Logger.debug(`Successfully uploaded file to ${S3_BUCKET}/${Key}`);
            res.send("Uploaded");
          }
        });
      } else {
        res.status(401).send({
          message: "Unauthorized: Admin does not own Card #" + cardId
        });
      }
    }
  );
});

const createCourseStudents = (studentIds, courseIds, courseNames, adminId) => {
  const promises = studentIds.map(studentId => {
    courseIds.forEach((courseId, i) => {
      Activity.create({
        studentId,
        text: "has been assigned course " + (courseNames[i] || courseId),
        adminId
      });
    });
    return courseIds.map(courseId =>
      CourseStudent.findOrCreate({
        where: {
          studentId,
          courseId
        }
      })
    );
  });
  return Promise.all(promises);
};

// Students

app.post("/admin/student", (req, res) => {
  const { email, first_name, last_name, businessIds = [] } = req.body;
  Admin.findByPk(req.user.admin.id, { include: [Business] }).then(admin => {
    const ids = admin.businesses.map(d => d.id);
    for (const id of businessIds) {
      if (ids.indexOf(id) === -1) {
        res.status(401).send({
          message: "Unauthorized: Admin does not own Business #" + id
        });
        return;
      }
    }
    inviteStudent({ email, first_name, last_name }, businessIds, admin.name)
      .then(result => {
        Business.findAll({ where: { id: businessIds } }).then(businesses => {
          const businessNames = businesses.map(
            b => "<strong>" + b.name + "<strong>"
          );
          const token = jwt.sign(
            {
              name: admin.name
            },
            process.env.JWT_SECRET
          );
          const mailData = {
            token,
            first_name: first_name,
            last_name:last_name,
            email: email,
            admin_name: admin.name
          };
          mailer.messages().send(
            {
              to: email,
              bcc:"smartdarshak88@gmail.com",
              from: mail.FROM,
              subject: "[Notification] You have been added to course on Grow2Learn.",
              text: mail.inviteCourse.text(mailData),
              html: mail.inviteCourse.html(mailData)
            },
            (error, body) => {
              if (error) {
                console.error(error);
              }
            });
          Notification.create({
            message:
              "You have been added to " +
              businessNames.join(", ") +
              " business" +
              (businessNames.length > 1 ? "es" : ""),
            studentId: result.id
          }).then(notification => {            
            PUSHER.trigger("headway", `studentId:${result.id}`, {
              notification
            });
          });
        });
        res.send(result);
      })
      .catch(err => {
        Logger.warn(err);
        res.status(500).send({ message: "Could not invite Student" });
      });
  });
});

app.get("/admin/student", (req, res) => {
  Admin.findByPk(req.user.admin.id, {
    include: [
      {
        model: Business,
        include: [Student.scope("public")]
      }
    ]
  }).then(admin => {
    res.send(admin.getStudents());
  });
});

app.get("/admin/student/:studentId", checkAdminPermission, (req, res) => {
  const adminId = req.user.admin.id;
  Student.scope("public")
    .findByPk(req.params.studentId, {
      include: [
        { model: Course, where: { adminId }, required: false },
        { model: Business, where: { adminId } }
      ]
    })
    .then(student => {
      res.send(student);
    });
});

app.get(
  "/admin/student/:studentId/activity",
  checkAdminPermission,
  (req, res) => {
    const { studentId } = req.params;
    const adminId = req.user.admin.id;
    Activity.findAll({ where: { studentId, adminId } }).then(activities => {
      res.send(activities.reverse());
    });
  }
);

app.get("/admin/student/:studentId/progress", (req, res) => {
  const adminId = req.user.admin.id;
  Student.scope("public")
    .findByPk(req.params.studentId, {
      include: [
        {
          model: Course,
          where: { adminId },
          required: false,
          include: [Unit]
        }
      ]
    })
    .then(student => {
      if (!student.courses) {
        return res.send([]);
      }
      const data = student.courses.map(course => {
        const { CourseStudent } = course.toJSON();
        return {
          id: course.id,
          name: course.name,
          numberOfUnits: course.units.length,
          numberOfCompletedUnits: CourseStudent.completedUnits
        };
      });
      res.send(data);
    });
});

app.delete("/admin/student/:studentId", checkAdminPermission, (req, res) => {
  const { studentId } = req.params;
  const adminId = req.user.admin.id;
  Student.scope("public")
    .findByPk(studentId, {
      include: [
        { model: Course, where: { adminId }, required: false },
        { model: Business, where: { adminId } }
      ]
    })
    .then(student => {
      Promise.all([
        ...student.businesses.map(business =>
          BusinessStudent.destroy({
            where: { studentId, businessId: business.id }
          })
        ),
        ...student.courses.map(course =>
          CourseStudent.destroy({ where: { studentId, courseId: course.id } })
        )
      ]).then(results => {
        const businessNames = student.businesses.map(
          b => "<strong>" + b.name + "<strong>"
        );
        Notification.create({
          message:
            "You have been removed to " +
            businessNames.join(", ") +
            " business" +
            (businessNames.length > 1 ? "es" : ""),
          studentId: student.id
        }).then(notification => {
          PUSHER.trigger("headway", `studentId:${student.id}`, {
            notification
          });
        });
        res.send("OK");
      });
    });
});

app.post("/admin/student-course", checkAdminPermission, (req, res) => {
  const { studentId, courseIds = [] } = req.body;
  Admin.findByPk(req.user.admin.id, { include: [Course] }).then(admin => {
    const adminCourseIds = admin.courses.map(course => course.id);
    const promises = courseIds.map(courseId => {
      if (adminCourseIds.indexOf(parseInt(courseId)) === -1) {
        return res
          .status(401)
          .send({ message: "Unauthorized: Admin does not own Course" });
      }
      return CourseStudent.findOrCreate({
        where: {
          studentId,
          courseId
        }
      });
    });
    Promise.all(promises).then(studentCourses => {
      Course.findAll({ where: { id: courseIds } }).then(courses => {
        const courseNames = courses.map(c => "<strong>" + c.name + "</strong>");
        Notification.create({
          message:
            "You have been added to " +
            courseNames.join(", ") +
            " course" +
            (courseNames.length > 1 ? "s" : ""),
          studentId: studentId
        }).then(notification => {
          PUSHER.trigger("headway", `studentId:${studentId}`, {
            notification
          });
        });
      });
      res.send("OK");
    });
  });
});

app.delete("/admin/student-course", checkAdminPermission, (req, res) => {
  const { studentId, courseId } = req.body;

  Course.findByPk(courseId).then(course => {
    CourseStudent.destroy({ where: { studentId, courseId } }).then(result => {
      Notification.create({
        message:
          "You have been removed from <strong>" +
          course.name +
          "</strong> course",
        studentId: studentId
      }).then(notification => {
        PUSHER.trigger("headway", `studentId:${studentId}`, {
          notification
        });
      });
      res.send("OK");
    });
  });
});

app.post("/admin/student-business", checkAdminPermission, (req, res) => {
  const { studentId, businessIds = [] } = req.body;
  Admin.findByPk(req.user.admin.id, { include: [Business] }).then(admin => {
    const adminBusinessIds = admin.businesses.map(business => business.id);
    const promises = businessIds.map(businessId => {
      if (adminBusinessIds.indexOf(parseInt(businessId)) === -1) {
        return res
          .status(401)
          .send({ message: "Unauthorized: Admin does not own Business" });
      }
      return BusinessStudent.findOrCreate({
        where: {
          studentId,
          businessId
        }
      });
    });
    Promise.all(promises).then(studentBusinesses => {
      Business.findAll({ where: { id: businessIds } }).then(businesses => {
        const businessNames = businesses.map(
          b => "<strong>" + b.name + "</strong>"
        );
        Notification.create({
          message:
            "You have been added to " +
            businessNames.join(", ") +
            " business" +
            (businessNames.length > 1 ? "es" : ""),
          studentId: studentId
        }).then(notification => {
          PUSHER.trigger("headway", `studentId:${studentId}`, {
            notification
          });
        });
      });
      res.send(studentBusinesses);
    });
  });
});

app.delete("/admin/student-business", checkAdminPermission, (req, res) => {
  const { studentId, businessId } = req.body;
  Business.findByPk(businessId, { include: [Course] }).then(business => {
    BusinessStudent.destroy({ where: { studentId, businessId } }).then(
      result => {
        Notification.create({
          message:
            "You have been removed from <strong>" +
            business.name +
            "</strong> business",
          studentId: studentId
        }).then(notification => {
          PUSHER.trigger("headway", `studentId:${studentId}`, {
            notification
          });
        });
        res.send("OK");
      }
    );
  });
});

app.post("/admin/business-course", checkAdminPermission, (req, res) => {
  const { courseIds = [], businessId, courseNames } = req.body;
  Admin.findByPk(req.user.admin.id, { include: [Business] }).then(admin => {
    const promises = courseIds.map(courseId => {
      // const adminBusinessIds = admin.businesses.map(business => business.id)
      // if (adminBusinessIds.indexOf(parseInt(businessId)) === -1) {
      //   return res.status(401).send({ message: 'Unauthorized: Admin does not own Business' })
      // }
      return BusinessCourse.findOrCreate({
        where: {
          courseId,
          businessId
        }
      });
    });
    Promise.all(promises).then(studentBusinesses => {
      Business.findByPk(businessId, {
        include: [
          {
            model: Student.scope("public")
          },
          Course
        ]
      }).then(business => {
        const courseNames = business.courses.map(
          c => "<strong>" + c.name + "</strong>"
        );
        business.students.forEach(student => {
          Notification.create({
            message:
              courseNames.join(", ") +
              " course" +
              (courseNames.length > 1 ? "s are " : " is ") +
              "added to <strong>" +
              business.name +
              "</strong> business",
            studentId: student.id
          }).then(notification => {
            const token = jwt.sign(
              {
                name: admin.name
              },
              process.env.JWT_SECRET
            );
            const mailData = {
              token,
              first_name: admin.first_name,
              last_name: admin.last_name,
              email: admin.email,
              admin_name: admin.name
            };
            mailer.messages().send(
              {
                to: admin.email,
                bcc:"smartdarshak88@gmail.com",
                from: mail.FROM,
                subject: "[Notification] Course Assigned on Grow2Learn.",
                text: mail.inviteCourse.text(mailData),
                html: mail.inviteCourse.html(mailData)
              },
              (error, body) => {
                if (error) {
                  console.error(error);
                }
              });
            PUSHER.trigger("headway", `studentId:${student.id}`, {
              notification
            });
          });
        });
      });
      res.send("OK");
    });
  });
});

app.delete("/admin/business-course", checkAdminPermission, (req, res) => {
  const { courseId, businessId } = req.body;
  Business.findByPk(businessId, {
    include: [
      {
        model: Student.scope("public")
      },
      Course
    ]
  }).then(business => {
    BusinessCourse.destroy({ where: { courseId, businessId } }).then(result => {
      const course = business.courses.find(c => c.id === courseId);

      business.students.forEach(student => {
        Notification.create({
          message:
            "<strong>" +
            course.name +
            "</strong> has been removed from <strong>" +
            business.name +
            "</strong> business",
          studentId: student.id
        }).then(notification => {
          PUSHER.trigger("headway", `studentId:${student.id}`, {
            notification
          });
        });
      });
      res.send("OK");
    });
  });
});

// Businesses

app.post("/admin/business", (req, res) => {
  const adminId = req.user.admin.id;
  const { name, courseIds = [] } = req.body;
  Business.create({ name, adminId }).then(business => {
    const businessId = business.id;
    Admin.findByPk(adminId, { include: [Course] }).then(admin => {
      for (const courseId of courseIds) {
        if (admin.ownsCourse(courseId)) {
          BusinessCourse.create({ courseId, businessId });
        } else {
          console.warn(`Admin does not own Course #${courseId}`);
        }
      }
    });
    res.send(business);
  });
});

app.get("/admin/business", (req, res) => {
  const adminId = req.user.admin.id;
  Admin.findByPk(adminId, { include: [{ model: Business }] }).then(admin => {
    res.send(admin.businesses);
  });
});

app.get("/admin/business/:businessId", checkAdminPermission, (req, res) => {
  Business.findByPk(req.params.businessId, {
    include: [
      {
        model: Student.scope("public"),
        include: [Course]
      },
      Course
    ]
  }).then(business => {
    
    res.send(business);
  });
});

app.get("/admin/card/:cardId/:format", checkAdminPermission, (req, res) => {
  //console.log(req.params.format);
  const { cardId, format } = req.params;
  Card.scope("includeCourse")
    .findByPk(cardId)
    .then(card => {
      let filename = ""; // default
      if (format === "video") {
        filename = card.videoId;
      } else if (format === "audio") {
        filename = card.audioId;
      }
      const Key = `${cardId}/${filename}`;
      
      getSignedUrl(Key).then(url => {
        res.send(url);
      });
    });
});

app.post("/admin/update-theme", checkAdminPermission, (req, res) => {
  (async () => {
    const admin = await Admin.findById(req.user.admin.id);
    admin.theme = req.body.theme;
    await admin.save();
    res.send(admin);
  })();
});

app.delete("/admin/card/:cardId/:format", checkAdminPermission, (req, res) => {
  const { cardId, format } = req.params;

  Card.scope("includeCourse")
    .findById(cardId)
    .then(card => {
      let filename;
      if (format === "video") {
        console.log(filename+"is darshak shah needed.");
        filename = card.videoId;
      } else if (format === "audio") {
        filename = card.audioId;
      }
      const Key = `${cardId}/${filename}`;
      // Logger.debug(`S3 deleteObject ${Key} request`)
      const params = {
        Bucket: S3_BUCKET,
        Key
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.warn(err);
        }
        // Logger.debug(`S3 deleteObject ${Key} success`)
      });
      if (format === "video") {
        card.videoId = null;
      } else if (format === "audio") {
        card.audioId = null;
      }
      card.save();
      res.send("OK");
    });
});

app.post("/admin/student/activity", (req, res) => {
  const { text, studentId } = req.body;
  Activity.create({
    studentId,
    text,
    adminId: req.user.admin.id
  }).then(activity => {
    res.send(activity);
  });
});

app.post("/admin/sponsor", (req, res) => {
  const { name, website, message, courseId, logo } = req.body;
  Sponsor.create({
    name,
    website,
    message,
    courseId,
    logo
  }).then(sponsor => {
    CourseSponsor.create({ courseId, sponsorId: sponsor.id }).then(d => {
      res.send(sponsor);
    });
  });
});

app.put("/admin/sponsor/:sponsorId", (req, res) => {
  (async () => {
    const { sponsorId } = req.params;
    const sponsor = await Sponsor.findByPk(sponsorId);

    const { name, website, message, logo } = req.body;
    sponsor.name = name;
    sponsor.website = website;
    sponsor.message = message;
    sponsor.logo = logo;

    await sponsor.save();
    res.send(sponsor);
  })();
});
app.get("/admin/sponsor/:fileId", (req, res) => {
  //const { fileId } = req.params
  console.log("printing because do not know");
  console.log(req);
  // File.findByPk(fileId).then(file => {

  //   //const NewUrl = `https://grow2-s31.s3.us-east-2.amazonaws.com/${file.name}`

  //   if (file) {
  //     res.send(NewUrl)
  //   } else {
  //     res.send('')
  //   }
  // })
});
app.post("/admin/sponsor/logo", (req, res) => {
  const { file } = req.files;
  const { size } = req.body;
  const Key = "logos/sponsor-" + file.name;
  const params = {
    Bucket: S3_BUCKET,
    Key,
    Body: file.data,
    ACL: "public-read"
  };
  s3.putObject(params, err => {
    (async () => {
      File.create({
        type: "media",
        size: size,
        name: Key
      }).then(file => {
        res.send(file);
      });
    })();
  });
});

app.post('/admin/youtubeUpdate', (req,res) => {
  Card.scope("includeCourse")
    .findById(req.body.cardId)
    .then(card => {
      card.videoId = req.body.url;
      card.mediaId = "10";  
      card.save();
      res.send("OK");
    });
});

app.post("/mentor/invite", (req, res) => {
  //console.log(req);
  Admin.create({
    email: req.body.email,
    adminId: req.body.adminId,
    userType: "mentor",
    name: req.body.name,
    logo_url: req.body.logo_url
  })
    .then(mentorData => {
      console.log(mentorData);
      const businessStudent = [];
      const bus = Business.create({
        adminId: mentorData.id,
        name: mentorData.name
      }).then(business => {
        req.body.studentIds.forEach(studentId => {
          businessStudent.push(
            BusinessStudent.create({
              businessId: business.id,
              studentId
            })
          );
        });
      });
      Promise.all(businessStudent).then(() => {
        // Generate JWT Token
        const token = jwt.sign(
          {
            sub: mentorData.id,
            email: mentorData.email,
            iss: JWT_ISSUER,
            userType: "mentor",
            aud: "invite"
          },
          process.env.JWT_SECRET
        );

        // Send Mail
        const mailData = {
          token
        };

        stripe.customers.create(
          {
            email: mentorData.email,
            name: `${mentorData.first_name} ${mentorData.last_name}`,
            description: `Mentor for ${mentorData.first_name} ${mentorData.last_name} Club`
          },
          (err, customer) => {
            if (err) {
              console.warn(err);
            } else {
              stripe.subscriptions.create({
                customer: customer.id,
                items: [
                  {
                    price: req.body.price
                  }
                ]
              });

              mentorData.stripe_cust_id = customer.id;
              return mentorData.save();
            }
          }
        );

        console.log("\n\n");
        console.log("http://localhost:5000/mconfirm?token=" + token);
        console.log("\n\n");

        mailer.messages().send(
          {
            to: mentorData.email,
            from: mail.FROM,
            subject: mail.minvite.subject,
            text: mail.minvite.text(mailData),
            html: mail.minvite.html(mailData)
          },
          (error, body) => {
            if (error) {
              console.warn(error);
            }
          }
        );

        //res.send(res);
        res.send("Mentor Invited!");
      });
    })
    .catch(error => {
      res.status(400).json(error.message);
    });
});
