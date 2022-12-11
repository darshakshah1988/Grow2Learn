import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Business from './Business'
import Course from './Course'

@Table({ timestamps: true })
export class BusinessCourse extends Model<BusinessCourse> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number

  @ForeignKey(() => Business)
  @Column
  businessId: number

  @ForeignKey(() => Course)
  @Column
  courseId: number

  // When new Course created, add StudentCourse for all existing Students
  // When new Student created, add StudentCourse
  @Column autoInviteStudents: boolean
}

export default BusinessCourse
