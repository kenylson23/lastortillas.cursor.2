import OptimizedHero from "../components/OptimizedHero";
import SimpleMenuShowcase from "../components/SimpleMenuShowcase";
import About from "../components/About";
import Features from "../components/Features";
import OurLocations from "../components/OurLocations";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function Landing() {
  return (
    <main>
      <Navigation />
      <OptimizedHero />
      <SimpleMenuShowcase />
      <About />
      <Features />
      <OurLocations />
      <Contact />
      <Footer />
    </main>
  );
}