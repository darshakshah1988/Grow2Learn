import * as slug from 'slug'
import { Table, Column, Model, HasMany, ForeignKey, BelongsTo, BelongsToMany, BeforeUpdate, BeforeCreate } from 'sequelize-typescript'
import Course from './Course'
import Card from './Card'

@Table({ timestamps: true })
export class Unit extends Model<Unit> {
  @Column name: string
  @Column slug: string
  @Column sortOrder: string

  @BeforeUpdate
  @BeforeCreate
  static slugify(instance: Unit) {
    instance.slug = slug(instance.name)
  }

  @ForeignKey(() => Course)
  @Column
  courseId: number

  @BelongsTo(() => Course)
  course: Course

  @HasMany(() => Card, {
    onDelete: 'cascade',
    hooks: true,
  })
  cards: Card[]
}

export default Unit
