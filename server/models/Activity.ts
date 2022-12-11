import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Student from './Student'
import Card from './Card'
import { Admin } from './Admin'

@Table({ timestamps: true })
export class Activity extends Model<Activity> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number

  @Column text: string
  @Column completed: boolean

  @ForeignKey(() => Card)
  @Column
  cardId: number

  // @BelongsTo(() => Card)
  // card: Card

  @ForeignKey(() => Student)
  @Column
  studentId: number

  @ForeignKey(() => Admin)
  @Column
  adminId: number
}

export default Activity
