import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const ArticleSchema = new mongoose.Schema(
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

const Article = mongoose.models.Article || mongoose.model("Article", ArticleSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB Atlas connection string."
    );
    process.exit(1);
  }

  const raw = await readFile(path.join(__dirname, "../src/data/mockArticles.json"), "utf-8");
  const articles = JSON.parse(raw);

  await mongoose.connect(uri, { dbName: "search_thala" });
  console.log(`Connected. Seeding ${articles.length} articles...`);

  for (const article of articles) {
    await Article.findOneAndUpdate(
      { slug: article.slug },
      { ...article, publishedAt: new Date(article.publishedAt) },
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
