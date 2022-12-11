import { Table, Column, Model, HasMany, ForeignKey, BelongsTo, DefaultScope, HasOne } from 'sequelize-typescript'
import Card from './Card'

@Table({ timestamps: true })
export class File extends Model<File> {

}

export default File
