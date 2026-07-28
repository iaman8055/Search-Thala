import mongoose, { Schema, models, model } from "mongoose";

export interface LikeDocument extends mongoose.Document {
  articleId: mongoose.Types.ObjectId;
  deviceId: string;
  createdAt: Date;
}

const LikeSchema = new Schema<LikeDocument>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    deviceId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

LikeSchema.index({ articleId: 1, deviceId: 1 }, { unique: true });

export const Like =
  (models.Like as mongoose.Model<LikeDocument>) || model<LikeDocument>("Like", LikeSchema);
