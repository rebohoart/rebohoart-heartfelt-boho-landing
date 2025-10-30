import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductHighlights from "@/components/ProductHighlights";
import CustomOrderButton from "@/components/CustomOrderButton";
import FinalCTA from "@/components/FinalCTA";

const Index = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen font-sans">
        <Hero />
        <ProductHighlights />
        <CustomOrderButton />
        <FinalCTA />
      </main>
    </>
  );
};

export default Index;
