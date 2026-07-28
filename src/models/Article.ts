import mongoose, { Schema, models, model } from "mongoose";

export interface ArticleDocument extends mongoose.Document {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  category: "top" | "business" | "sports" | "technology";
  tag: string;
  publishedAt: Date;
  likes: number;
}

const ArticleSchema = new Schema<ArticleDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["top", "business", "sports", "technology"],
      index: true,
    },
    tag: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Article =
  (models.Article as mongoose.Model<ArticleDocument>) ||
  model<ArticleDocument>("Article", ArticleSchema);
