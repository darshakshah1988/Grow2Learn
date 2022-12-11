import { Table, Column, Model, HasMany, BelongsToMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Admin from './Admin'
import BusinessCourse from './BusinessCourse'
import BusinessStudent from './BusinessStudent'
import Course from './Course'
import CourseStudent from './CourseStudent'
import Mentor from './Mentor'
import Student from './Student'

@Table({ timestamps: true })
export class Business extends Model<Business> {
  @Column name: string

  @ForeignKey(() => Admin)
  @Column
  adminId: number

  @BelongsTo(() => Admin)
  admin: Admin

  @HasMany(() => Mentor)
  mentors: Mentor[]

  @BelongsToMany(() => Course, {
    through: {
      model: () => BusinessCourse,
      unique: false,
    },
  })
  courses: Course[]

  @BelongsToMany(() => Student, {
    through: {
      model: () => BusinessStudent,
      unique: false,
    },
  })
  students: Student[]
}

export default Business
