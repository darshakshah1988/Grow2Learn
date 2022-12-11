import * as slug from 'slug'
import { Table, Column, Model, ForeignKey, BelongsTo,  Scopes, BelongsToMany } from 'sequelize-typescript'
import File from './File'
import Course from './Course';
import CourseSponsor from './CourseSponsor';

@Scopes({
  includeFiles: {
    include: [{
      model: () => File,
      as: 'media'
    }]
  }
})

@Table({ timestamps: true })
export class Sponsor extends Model<Sponsor> {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number
  
    @Column name: string
    @Column message: string
    @Column website: string

    @BelongsToMany(() => Course, {
      through: {
        model: () => CourseSponsor,
        unique: false,
      },
    })
    courses: Course[]
    
    @Column
    logo: number
}

export default Sponsor
