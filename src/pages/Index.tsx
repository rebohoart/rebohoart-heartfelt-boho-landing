import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductHighlights from "@/components/ProductHighlights";
import CustomOrderButton from "@/components/CustomOrderButton";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton"; // 👈 linha nova

const Index = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen font-sans">
        <Hero />
        <ProductHighlights />
        <CustomOrderButton />
      </main>
      <Footer />
      <WhatsAppButton /> {/* 👈 linha nova */}
    </>
  );
};

export default Index;