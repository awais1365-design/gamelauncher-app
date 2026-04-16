import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppDocument = App & Document;

// -------------------------
// VERSION SCHEMA
// -------------------------
@Schema({ _id: false })
export class Version {
  @Prop({ required: true })
  version: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  size: number;

  // When version was created
  @Prop({ default: Date.now })
  createdAt: Date;

  // When version was last updated (edit support)
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const VersionSchema = SchemaFactory.createForClass(Version);

// -------------------------
// APP SCHEMA
// -------------------------
@Schema({ timestamps: true }) // gives createdAt + updatedAt automatically
export class App {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({ required: true })
  url: string;

  // latest active version
  @Prop({ default: '1.0.0' })
  version: string;

  // version history
  @Prop({ type: [VersionSchema], default: [] })
  versions: Version[];
}

export const AppSchema = SchemaFactory.createForClass(App);

// -------------------------
// INDEX (case-insensitive unique app name)
// -------------------------
AppSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  },
);
