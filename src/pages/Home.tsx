
import React from 'react';
import Header from '../components/Header';
import HomeHero from '../components/home/HomeHero';
import ScrollVelocityCarousel from '../components/landing/ScrollVelocityCarousel';
import HowItWorks from '../components/home/HowItWorks';
import FavoriteMoments from '../components/home/FavoriteMoments';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HomeHero />
      <ScrollVelocityCarousel />
      <HowItWorks />
      <FavoriteMoments />
      <Footer />
    </div>
  );
};

export default Home;
