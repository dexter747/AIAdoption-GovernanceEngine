import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const posts = [
  {
    slug: 'introducing-velanova-2',
    title: 'Introducing Velanova 2.0: The Future of Database Intelligence',
    excerpt:
      "Today we're excited to announce Velanova 2.0, featuring support for 10+ AI providers, 20+ database connectors, and a completely redesigned interface.",
    date: 'January 15, 2025',
    readTime: '5 min read',
    author: 'Velanova Team',
    image: '/blog/velanova-2.jpg',
    category: 'Product',
  },
  {
    slug: 'claude-3-5-integration',
    title: 'Claude 3.5 Sonnet Integration: Smarter SQL Generation',
    excerpt:
      'Learn how our new Claude 3.5 integration delivers more accurate SQL queries with better context understanding and fewer errors.',
    date: 'January 10, 2025',
    readTime: '4 min read',
    author: 'Engineering Team',
    image: '/blog/claude-integration.jpg',
    category: 'Engineering',
  },
  {
    slug: 'enterprise-security-features',
    title: 'Enterprise Security Features You Need to Know About',
    excerpt:
      'A deep dive into our enterprise security features including SSO, audit logs, role-based access control, and data encryption.',
    date: 'January 5, 2025',
    readTime: '6 min read',
    author: 'Security Team',
    image: '/blog/security.jpg',
    category: 'Security',
  },
  {
    slug: 'ai-database-best-practices',
    title: 'Best Practices for AI-Powered Database Queries',
    excerpt:
      'Tips and tricks for getting the most out of Velanova, from writing better prompts to optimizing your query results.',
    date: 'December 28, 2024',
    readTime: '7 min read',
    author: 'Velanova Team',
    image: '/blog/best-practices.jpg',
    category: 'Tutorial',
  },
];

const categories = ['All', 'Product', 'Engineering', 'Security', 'Tutorial'];

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights, tutorials, and updates on AI-powered database intelligence, enterprise integrations, and best practices.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-white/5 rounded-full blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-medium text-white mb-4">Blog</h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              News, tutorials, and insights about Velanova, database intelligence, and the future of
              data analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-white/10 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  category === 'All'
                    ? 'bg-zinc-950 text-white'
                    : 'bg-black/10 text-zinc-500 hover:bg-black/20'
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
                  className="group bg-black rounded-2xl border border-white/10 overflow-hidden hover:border-zinc-700/60 hover:shadow-xl transition-all"
                >
                  {/* Image placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-zinc-900/40 to-zinc-900/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-white/5 text-zinc-400 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>

                    <h2 className="text-xl font-medium text-white mb-2 group-hover:text-zinc-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                    <div className="flex items-center gap-4 text-sm text-zinc-500">
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
              <button className="px-8 py-3 bg-black/10 text-zinc-400 font-medium rounded-xl hover:bg-black/20 transition-colors">
                Load More Posts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-zinc-400 to-zinc-600">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4">Stay Updated</h2>
            <p className="text-white/80 mb-8">
              Subscribe to our newsletter for the latest updates, tutorials, and product news.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black/10 text-zinc-400 font-medium rounded-xl hover:bg-black/10 transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
