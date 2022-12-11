import * as slug from 'slug'
import { Table, Column, Model, HasMany, ForeignKey, BelongsTo, BelongsToMany, BeforeUpdate, BeforeCreate } from 'sequelize-typescript'
import Student from './Student'
import Unit from './Unit'
import CourseStudent from './CourseStudent'
import Business from './Business'
import BusinessCourse from './BusinessCourse'
import Admin from './Admin'
import Sponsor from './Sponsor'
import CourseSponsor from './CourseSponsor'

@Table({ timestamps: true })
export class Course extends Model<Course> {
  @Column name: string
  @Column slug: string
  @Column sortOrder: string

  @BeforeUpdate
  @BeforeCreate
  static slugify(instance: Course) {
    instance.slug = slug(instance.name)
  }

  @ForeignKey(() => Admin)
  @Column
  adminId: number

  @BelongsTo(() => Admin)
  admin: Admin

  @HasMany(() => Unit, {
    onDelete: 'cascade',
    hooks: true,
  })
  units: Unit[]

  @BelongsToMany(() => Business, {
    through: {
      model: () => BusinessCourse,
      unique: false,
    },
  })
  businesses: Business[]

  @BelongsToMany(() => Student, {
    through: {
      model: () => CourseStudent,
      unique: false,
    },
  })
  students: Student[]

  @BelongsToMany(() => Sponsor,{
    through: {
      model: () => CourseSponsor,
      unique: false,
    },
  })
  sponsors: Sponsor[]
}

export default Course
