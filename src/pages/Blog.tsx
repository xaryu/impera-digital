import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const posts = [
  {
    title: "The Psychology of Luxury Branding in 2026",
    excerpt: "How elite brands leverage perception, exclusivity, and narrative to command premium positioning in saturated markets.",
    category: "Brand Strategy",
    date: "February 12, 2026",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  },
  {
    title: "Why Your Digital Presence Is Your Most Valuable Asset",
    excerpt: "In an era of first impressions, your website and digital footprint determine whether prospects trust you or move on.",
    category: "Digital Strategy",
    date: "February 5, 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    title: "Designing for Authority: Lessons from Heritage Brands",
    excerpt: "What modern agencies can learn from century-old luxury houses about visual hierarchy, restraint, and timeless design.",
    category: "Design",
    date: "January 28, 2026",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80",
  },
  {
    title: "Performance Marketing for Premium Brands",
    excerpt: "Balancing aggressive growth targets with brand integrity — a framework for high-end digital campaigns.",
    category: "Marketing",
    date: "January 20, 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "The ROI of Exceptional Web Design",
    excerpt: "Data-driven insights on how design quality directly impacts conversion rates, trust signals, and customer lifetime value.",
    category: "Web Design",
    date: "January 14, 2026",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
  },
  {
    title: "Building a Brand That Commands Respect",
    excerpt: "From naming conventions to visual systems — the foundational elements that separate forgettable brands from iconic ones.",
    category: "Brand Strategy",
    date: "January 6, 2026",
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Insights & Perspectives
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cream leading-tight mb-6">
            The Impera Journal
          </h1>
          <p className="font-body text-gold-muted max-w-2xl mx-auto leading-relaxed">
            Strategic thinking, design philosophy, and industry insights from the minds behind premium digital experiences.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-6 pb-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-0 border border-gold/20 overflow-hidden">
            <div className="h-72 md:h-auto overflow-hidden">
              <img
                src={posts[0].image}
                alt={posts[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-10 md:p-14 flex flex-col justify-center bg-navy/50">
              <span className="font-body text-xs tracking-[0.3em] text-gold uppercase mb-4">
                Featured — {posts[0].category}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-cream mb-4 leading-tight">
                {posts[0].title}
              </h2>
              <p className="font-body text-gold-muted leading-relaxed mb-6">
                {posts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-gold-muted/60">{posts[0].date}</span>
                <span className="font-body text-sm text-gold tracking-wider uppercase cursor-pointer hover:text-cream transition-colors">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 pb-24">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post, i) => (
              <article
                key={i}
                className="border border-gold/10 bg-navy/30 hover:border-gold/30 transition-all duration-500 group"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">
                    {post.category}
                  </span>
                  <h3 className="font-display text-xl font-bold text-cream mt-3 mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="font-body text-sm text-gold-muted leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-gold-muted/60">{post.date}</span>
                    <span className="font-body text-xs text-gold tracking-wider uppercase cursor-pointer hover:text-cream transition-colors">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
