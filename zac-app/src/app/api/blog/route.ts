import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import User from '@/models/User';
import { getFallbackBlogDb, saveFallbackBlogPost } from '@/lib/blog-fallback';
import { getFallbackUserDb } from '@/lib/db-fallback';
import { verifySessionToken } from '@/lib/auth';

// Helper to generate slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export async function GET(request: Request) {
  try {
    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('[API /blog GET] MongoDB connection failed, falling back to local JSON database:', dbError);
      isLocalFallback = true;
    }

    let posts: any[] = [];
    if (isLocalFallback) {
      posts = getFallbackBlogDb();
    } else {
      posts = await BlogPost.find({}).sort({ createdAt: -1 });
    }

    // Sort by createdAt descending (newest first)
    posts.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('[API /blog GET]', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate session (all logged-in users are admins)
    const cookieStore = await cookies();
    const token = cookieStore.get('zac_auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No session token found.' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token.' }, { status: 401 });
    }

    const { title, content, excerpt, category, author, coverImage, readTime } = await request.json();

    if (!title || !content || !excerpt || !category || !author || !coverImage || !readTime) {
      return NextResponse.json({ error: 'All fields (title, content, excerpt, category, author, coverImage, readTime) are required.' }, { status: 400 });
    }

    const slug = slugify(title);

    let isLocalFallback = false;
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('[API /blog POST] MongoDB connection failed, falling back to local JSON database:', dbError);
      isLocalFallback = true;
    }

    if (isLocalFallback) {
      const saved = saveFallbackBlogPost({
        title,
        slug,
        content,
        excerpt,
        category,
        author,
        coverImage,
        readTime
      });
      if (!saved.success) {
        return NextResponse.json({ error: saved.error || 'Failed to save blog post to local fallback database.' }, { status: 500 });
      }
    } else {
      // Check if post already exists in MongoDB
      const existingPost = await BlogPost.findOne({ slug });
      if (existingPost) {
        return NextResponse.json({ error: 'Blog post with this title/slug already exists.' }, { status: 400 });
      }

      // Create post in MongoDB
      await BlogPost.create({
        title,
        slug,
        content,
        excerpt,
        category,
        author,
        coverImage,
        readTime
      });
    }

    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (error: any) {
    console.error('[API /blog POST]', error);
    return NextResponse.json({ error: error.message || 'Failed to create blog post.' }, { status: 500 });
  }
}
