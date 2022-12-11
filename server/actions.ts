import * as passwordGenerator from "generate-password";
import * as jwt from "jsonwebtoken";
import Admin from "./models/Admin";
import Student from "./models/Student";
import Mentor from "./models/Mentor";
import {
  Business,
  BusinessCourse,
  BusinessStudent,
  Activity,
  Unit,
  Card,
  CourseStudent,
  Course
} from "./models";
import { Logger } from "./logger";
import { UnitProgress } from "./interfaces";
import { PASSWORD_OPTS, JWT_ISSUER } from "./constants";
import mailer from "./mailer";
import mail from "./mail";
import { hashPasswordSync } from "./authentication";

export const createAdmin = data => {
  const { email, name, first_name, last_name } = data;
  const password = hashPasswordSync(data.password);
  return Admin.findOne({ where: { email } }).then(admin => {
    if (!admin) {
      return Admin.create({
        name,
        first_name,
        last_name,
        email,
        password
      });
    } else {
      return null;
    }
  });
};

export const createCourse = (adminId, name, businessIds = []) => {
  return Course.create({
    name,
    adminId
  }).then(course => {
    if (businessIds.length) {
      const promises = businessIds.map(businessId => {
        return linkBusinessToCourse(businessId, course.id);
      });
      return Promise.all(promises).then(d => {
        return course;
      });
    }
    return course;
  });
};

export const createStudent = data => {
  const { email, first_name, last_name } = data;
  const password = hashPasswordSync(data.password);
  return Student.create({
    first_name,
    last_name,
    email,
    password
  });
};

export const linkBusinessToCourse = (businessId, courseId) => {
  return BusinessCourse.findOrCreate({
    where: {
      businessId,
      courseId
      // autoInviteStudents: true,
    }
  }).then(businessCourse => {
    return Business.findByPk(businessId, { include: [Student] }).then(
      business => {
        return business.students.map(student => {
          return student.addToCourse(courseId);
        });
      }
    );
  });
};

export const createMentor = data => {
  const { email, first_name, last_name } = data;
  const password = hashPasswordSync(data.password);
  return Mentor.create({
    first_name,
    last_name,
    email,
    password
  });
};

export const addStudentToBusinesses = (
  student: Student,
  businessIds: number[]
) => {
  const promises = businessIds.map(id => addStudentToBusiness(student, id));
  return Promise.all(promises);
};

export const addStudentToBusiness = (student: Student, businessId: number) => {
  return BusinessStudent.findOrCreate({
    where: {
      businessId,
      studentId: student.id
    }
  }).then(businessStudents => {
    Business.findByPk(businessId, {
      include: [{ model: Course }]
    }).then(business => {
      // TODO: where BusinessCourse.autoInviteStudents true
      business.courses.forEach(course => {
        student.addToCourse(course.id);
      });
    });
    return businessStudents;
  });
};

export const inviteStudent = async (
  payload,
  businessIds: number[],
  adminName
) => {
  const { email } = payload;
  return Student.findOne({ where: { email }, include: [Business] }).then(
    student => {
      if (!student) {
        // Invite New Student
        const password: string = passwordGenerator.generate(PASSWORD_OPTS);
        return createStudent({ email, password }).then(student => {
          const token = jwt.sign(
            {
              sub: student.id,
              email: student.email,
              iss: JWT_ISSUER,
              userType: "student",
              aud: "invite"
            },
            process.env.JWT_SECRET
          );
          console.log("http://localhost:5000/invite?token=" + token);
          console.log("\n\n");
          const mailData = {
            token,
            adminName
          };
          mailer.messages().send(
            {
              to: student.email,
              from: mail.FROM,
              subject: mail.invite.subject,
              text: mail.invite.text(mailData),
              html: mail.invite.html(mailData)
            },
            (error, body) => {
              if (error) {
                console.warn(error);
              }
            }
          );
          return addStudentToBusinesses(student, businessIds).then(d => {
            return {
              id: student.id,
              studentExists: false,
              message: "Invite Sent",
              email: student.email
            };
          });
        });
      } else {
        // Enrol Existing Student
        return addStudentToBusinesses(student, businessIds).then(d => {
          return {
            id: student.id,
            studentExists: true,
            message: "Student Enrolled",
            email: student.email
          };
        });
      }
    }
  );
};

export const getStudentActivitiesByUnit = async (unitId, studentId) => {
  return Promise.all([
    Activity.findAll({ where: { studentId } }),
    Unit.findByPk(unitId, { include: [Card] }).then(unit => unit.cards)
  ]).then(([activities, cards]) => {
    const cardIds = cards.map(card => card.id);
    // .sort((a, b) => a.createdAt - b.createdAt).pop()
    return activities.filter(activity => cardIds.indexOf(activity.cardId) >= 0);
  });
};

export const incrementCompletedUnits = async (courseId, studentId) => {
  return CourseStudent.findOne({
    where: {
      studentId,
      courseId
    }
  }).then(courseStudent => {
    courseStudent.completedUnits = courseStudent.completedUnits + 1;
    return courseStudent.save();
  });
};

export const studentUnitProgress = async (
  unitId,
  studentId
): Promise<UnitProgress> => {
  return Promise.all([
    getStudentActivitiesByUnit(unitId, studentId),
    Unit.findByPk(unitId, { include: [Card] })
  ]).then(([activities, unit]) => {
    const cards = unit.cards;
    const completed = activities.filter(activity => activity.completed);
    // look at dates
    // activities.forEach(activity => {
    //   Logger.debug(activity.createdAt)
    // })
    const res: UnitProgress = {
      numberOfCards: cards.length,
      completedLength: completed.length,
      unitCompleted: completed.length === cards.length
    };
    return res;
  });
};
