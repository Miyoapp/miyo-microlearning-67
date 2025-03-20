
import React from 'react';
import Header from '../components/Header';
import HomeHero from '../components/home/HomeHero';
import ValueProposition from '../components/home/ValueProposition';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FeaturedCourses from '../components/home/FeaturedCourses';
import CallToAction from '../components/home/CallToAction';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HomeHero />
      <ValueProposition />
      <HowItWorks />
      <FeaturedCourses />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
