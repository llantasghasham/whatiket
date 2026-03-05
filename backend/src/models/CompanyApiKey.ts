import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "company_api_keys",
  timestamps: false
})
class CompanyApiKey extends Model<CompanyApiKey> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.INTEGER })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING)
  label: string;

  @Column(DataType.STRING)
  token: string;

  @Column({ field: "webhook_url", type: DataType.STRING })
  webhookUrl: string | null;

  @Column({ field: "webhook_secret", type: DataType.STRING })
  webhookSecret: string | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @Column({ field: "last_used_at", type: DataType.DATE })
  lastUsedAt: Date | null;

  @Column({ field: "api_key_consultas", type: DataType.STRING(500), allowNull: true })
  apiKeyConsultas?: string;

  @Column({ field: "api_key_transcricao", type: DataType.STRING(500), allowNull: true })
  apiKeyTranscricao?: string;
}

export default CompanyApiKey;
