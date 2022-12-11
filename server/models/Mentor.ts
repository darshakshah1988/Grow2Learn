import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Business from './Business'

@Table({ timestamps: true })
export class Mentor extends Model<Mentor> {
  @Column first_name: string
  @Column last_name: string
  @Column email: string
  @Column password: string
  @Column readonly userType: string = 'mentor'

  @ForeignKey(() => Business)
  @Column
  businessId: number

  @BelongsTo(() => Business)
  business: Business
}

export default Mentor
