import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Course from './Course'
import Sponsor from './Sponsor'

@Table({ timestamps: true })
export class CourseSponsor extends Model<CourseSponsor> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number


  @ForeignKey(() => Course)
  @Column
  courseId: number

  @ForeignKey(() => Sponsor)
  @Column
  sponsorId: number
  // @Column currentUnitId: number // proper foreign key?
}

export default CourseSponsor
