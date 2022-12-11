import * as slug from 'slug'
import { Table, Column, Model, HasMany, ForeignKey, HasOne, BelongsTo, BelongsToMany, BeforeUpdate, BeforeCreate, DataType, Scopes, DefaultScope } from 'sequelize-typescript'
import Admin from './Admin'

@Table({ timestamps: true })
export class SharedContent extends Model<SharedContent> {
    @Column course: number
    
    @ForeignKey(() => Admin)
    @Column creator: number
}

export default SharedContent