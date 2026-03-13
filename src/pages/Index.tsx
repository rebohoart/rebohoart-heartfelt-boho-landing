import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductHighlights from "@/components/ProductHighlights";
import Testimonials from "@/components/Testimonials";
import AboutMe from "@/components/AboutMe";
import CustomOrderButton from "@/components/CustomOrderButton";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen font-sans">
        <Hero />
        <ProductHighlights />
        <Testimonials />
        <AboutMe />
        <CustomOrderButton />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Index;