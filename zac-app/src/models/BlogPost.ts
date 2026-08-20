import mongoose, { Schema } from 'mongoose';

const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true,
  },
  coverImage: {
    type: String,
    required: [true, 'Please provide a cover image URL'],
  },
  readTime: {
    type: String,
    required: [true, 'Please provide estimated read time'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
