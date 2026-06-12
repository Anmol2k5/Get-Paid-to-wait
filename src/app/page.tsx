import Nav from "@/components/nav";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Platforms from "@/components/platforms";
import Stats from "@/components/stats";
import Cta from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Platforms />
      <Stats />
      <Cta />
      <Footer />
    </>
  );
}
