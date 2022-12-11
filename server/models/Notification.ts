import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Student from './Student'

@Table({ timestamps: true })
export class Notification extends Model<Notification> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number

  @Column message: string

  @BelongsTo(() => Student)
  student: Student

  @ForeignKey(() => Student)
  @Column
  studentId: number
}

export default Notification
