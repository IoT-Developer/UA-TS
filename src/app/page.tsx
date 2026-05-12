import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { CourseTracks } from '@/components/marketing/course-tracks';
import { WhyUs } from '@/components/marketing/why-us';
import { CtaFooter } from '@/components/marketing/cta-footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CourseTracks />
        <WhyUs />
        <CtaFooter />
      </main>
    </>
  );
}
