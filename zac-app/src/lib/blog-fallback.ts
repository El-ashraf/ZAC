import fs from 'fs';
import path from 'path';

const REPO_BLOG_FILE = path.join(process.cwd(), 'blog_db.json');
const TMP_BLOG_FILE = path.join('/tmp', 'blog_db.json');

export function getBlogFilePath(): string {
  try {
    if (fs.existsSync('/tmp')) {
      if (!fs.existsSync(TMP_BLOG_FILE)) {
        if (fs.existsSync(REPO_BLOG_FILE)) {
          fs.copyFileSync(REPO_BLOG_FILE, TMP_BLOG_FILE);
        } else {
          fs.writeFileSync(TMP_BLOG_FILE, '[]', 'utf-8');
        }
      }
      return TMP_BLOG_FILE;
    }
  } catch (error) {
    console.warn('Failed to access /tmp directory, falling back to repository blog file:', error);
  }
  return REPO_BLOG_FILE;
}

export interface FallbackBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string;
  readTime: string;
  createdAt?: string;
}

export function getFallbackBlogDb(): FallbackBlogPost[] {
  try {
    const blogFile = getBlogFilePath();
    if (!fs.existsSync(blogFile)) {
      return [];
    }
    const data = fs.readFileSync(blogFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fallback blog DB:', error);
    return [];
  }
}

export function saveFallbackBlogPost(post: FallbackBlogPost): { success: boolean; error?: string } {
  try {
    const blogFile = getBlogFilePath();
    const db = getFallbackBlogDb();
    
    // Check if post with same slug already exists
    if (db.some(p => p.slug.toLowerCase() === post.slug.toLowerCase())) {
      return { success: false, error: 'Blog post with this title/slug already exists' };
    }
    
    db.push({
      ...post,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(blogFile, JSON.stringify(db, null, 2), 'utf-8');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving to fallback blog DB:', error);
    return { success: false, error: error.message || String(error) };
  }
}
