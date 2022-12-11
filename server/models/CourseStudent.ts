import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Course from './Course'
import Student from './Student'

@Table({ timestamps: true })
export class CourseStudent extends Model<CourseStudent> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number

  @Column assigned: Date

  @ForeignKey(() => Course)
  @Column
  courseId: number

  @ForeignKey(() => Student)
  @Column
  studentId: number

  @Column completedUnits: number
  @Column timeSpentOnCurrentUnit: number
  // @Column currentUnitId: number // proper foreign key?
}

export default CourseStudent
