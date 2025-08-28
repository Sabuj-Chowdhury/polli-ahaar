import BlogTeasers from "../../components/Home/BlogTeasers";
import FinalCta from "../../components/Home/FinalCta";
import Hero from "../../components/Home/Hero";
import Testimonials from "../../components/Home/Testimonials";
import WhyChooseUs from "../../components/Home/WhyChooseUs";

const HomePage = () => {
  return (
    <div>
      <Hero />
      <WhyChooseUs />
      <Testimonials />
      <BlogTeasers />
      <FinalCta />
    </div>
  );
};

export default HomePage;
