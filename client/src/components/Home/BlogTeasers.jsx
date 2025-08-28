/* BlogTeasers.jsx */
import { Link } from "react-router";

const posts = [
  {
    slug: "khati-modhu-chena",
    title: "খাঁটি মধু চেনার সহজ উপায়",
    excerpt:
      "বাড়িতেই কীভাবে খাঁটি মধু শনাক্ত করবেন—কয়েকটি সহজ পরীক্ষায় জানুন সত্যি নাকি ভেজাল।",
    image:
      "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "deshi-chaler-pusti",
    title: "দেশি চালের পুষ্টিগুণ ও উপকারিতা",
    excerpt:
      "দেশি চাল শুধু সুস্বাদুই নয়, পুষ্টিগুণেও ভরপুর—জানুন কার্বস, ফাইবার ও ভিটামিনের কথা।",
    image:
      "https://images.unsplash.com/photo-1604335399105-a0d7c5b9d9a2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "ghir-asol-ghran",
    title: "ঘির আসল ঘ্রাণ কেন আলাদা?",
    excerpt:
      "খাঁটি দুধ থেকে তৈরি ঘি—কেন এর সুবাস ও স্বাদ এত আলাদা, জানুন প্রক্রিয়ার কথা।",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
  },
];

const BlogTeasers = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-brand-neutral-900">
              খাদ্য ও স্বাস্থ্য টিপস
            </h2>
            <p className="font-body mt-3 text-brand-neutral-600">
              পুষ্টি, নিরাপত্তা ও খাঁটিতার টিপস—জানুন, বুঝে কিনুন।
            </p>
          </div>
          <Link
            to="/blog"
            className="font-body shrink-0 bg-brand-primary hover:bg-brand-primaryDark text-white px-5 py-2.5 rounded-xl"
          >
            সব আর্টিকেল
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm"
            >
              <Link to={`/blog/${p.slug}`} className="block">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg text-brand-neutral-900">
                    {p.title}
                  </h3>
                  <p className="font-body mt-2 text-sm text-brand-neutral-600 leading-6">
                    {p.excerpt}
                  </p>
                  <span className="font-body mt-3 inline-block text-brand-primary">
                    আরো পড়ুন →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogTeasers;
