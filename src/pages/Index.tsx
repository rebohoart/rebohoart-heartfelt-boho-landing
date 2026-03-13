import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductHighlights from "@/components/ProductHighlights";
import AboutMe from "@/components/AboutMe";                    // 👈 adiciona aqui
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
        <AboutMe />                                             {/* 👈 e aqui */}
        <CustomOrderButton />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Index;