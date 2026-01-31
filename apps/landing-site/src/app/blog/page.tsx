'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Calendar, Clock, User } from 'lucide-react';

const posts = [
  {
    slug: 'introducing-ai-nexus-2',
    title: 'Introducing AI Nexus 2.0: The Future of Database Intelligence',
    excerpt: 'Today we\'re excited to announce AI Nexus 2.0, featuring support for 10+ AI providers, 20+ database connectors, and a completely redesigned interface.',
    date: 'January 15, 2025',
    readTime: '5 min read',
    author: 'AI Nexus Team',
    image: '/blog/ai-nexus-2.jpg',
    category: 'Product',
  },
  {
    slug: 'claude-3-5-integration',
    title: 'Claude 3.5 Sonnet Integration: Smarter SQL Generation',
    excerpt: 'Learn how our new Claude 3.5 integration delivers more accurate SQL queries with better context understanding and fewer errors.',
    date: 'January 10, 2025',
    readTime: '4 min read',
    author: 'Engineering Team',
    image: '/blog/claude-integration.jpg',
    category: 'Engineering',
  },
  {
    slug: 'enterprise-security-features',
    title: 'Enterprise Security Features You Need to Know About',
    excerpt: 'A deep dive into our enterprise security features including SSO, audit logs, role-based access control, and data encryption.',
    date: 'January 5, 2025',
    readTime: '6 min read',
    author: 'Security Team',
    image: '/blog/security.jpg',
    category: 'Security',
  },
  {
    slug: 'ai-database-best-practices',
    title: 'Best Practices for AI-Powered Database Queries',
    excerpt: 'Tips and tricks for getting the most out of AI Nexus, from writing better prompts to optimizing your query results.',
    date: 'December 28, 2024',
    readTime: '7 min read',
    author: 'AI Nexus Team',
    image: '/blog/best-practices.jpg',
    category: 'Tutorial',
  },
];

const categories = ['All', 'Product', 'Engineering', 'Security', 'Tutorial'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Nexus</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/download" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Download
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Blog
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              News, tutorials, and insights about AI Nexus, database intelligence, and the future of data analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  category === 'All'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all"
                >
                  {/* Image placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                Load More Posts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-white/80 mb-8">
              Subscribe to our newsletter for the latest updates, tutorials, and product news.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">© 2025 AI Nexus. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
