import {
  Table,
  Column,
  Model,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Business from "./Business";

@Table({ timestamps: true })
export class Document extends Model<Document> {
  @Column file: string;
  @Column type: string;
  @ForeignKey(() => Business)
  @Column
  businessId: number;

  @BelongsTo(() => Business)
  business: Business;
}

export default Document;
