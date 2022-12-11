import { Table, Column, Model, HasMany, BelongsToMany, Scopes } from 'sequelize-typescript'

import Course from './Course'
import CourseStudent from './CourseStudent'
import Card from './Card'
import Activity from './Activity'
import Business from './Business'
import BusinessStudent from './BusinessStudent'
import Notification from './Notification'

@Scopes({
  public: {
    attributes: ['id', 'first_name', 'last_name', 'email', 'lastLoggedIn'],
  },
})
@Table({ timestamps: true })
export class Student extends Model<Student> {

  @Column first_name: string
  @Column last_name: string
  @Column email: string
  @Column password: string
  @Column lastLoggedIn: Date
  @Column readonly userType: string = 'student'

  @BelongsToMany(() => Course, {
    through: {
      model: () => CourseStudent,
      unique: false,
    },
  })
  courses: Course[]

  @BelongsToMany(() => Business, {
    through: {
      model: () => BusinessStudent,
      unique: false,
    },
  })
  businesses: Business[]

  @HasMany(() => Notification)
  notifications: Notification[]

  displayName() {
    const name = [this.first_name, this.last_name].join(' ').trim()
    return name
  }

  addToCourse(courseId) {
    const studentId = this.id
    return CourseStudent.findOrCreate({ where: { courseId, studentId }})
  }
}

export default Student
