import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductHighlights from "@/components/ProductHighlights";
import Testimonials from "@/components/Testimonials";
import BrandStory from "@/components/BrandStory";
import FinalCTA from "@/components/FinalCTA";

const Index = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen font-sans">
        <Hero />
        <ProductHighlights />
        <Testimonials />
        <BrandStory />
        <FinalCTA />
      </main>
    </>
  );
};

export default Index;
