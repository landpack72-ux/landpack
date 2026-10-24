import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import SolutionsList from "./components/SolutionsList";
import AdviceSection from "./components/AdviceSection";
import ContactSection from "./components/ContactSection";
import MapSection from "./components/MapSection";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Products />
        <SolutionsList />
        <AdviceSection />
        <ContactSection />
        <MapSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
