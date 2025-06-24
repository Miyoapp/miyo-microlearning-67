
import React from 'react';
import Header from '../components/Header';
import HomeHero from '../components/home/HomeHero';
import CategoryCarousel from '../components/landing/CategoryCarousel';
import HowItWorks from '../components/home/HowItWorks';
import FavoriteMoments from '../components/home/FavoriteMoments';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HomeHero />
      <CategoryCarousel />
      <HowItWorks />
      <FavoriteMoments />
      <Footer />
    </div>
  );
};

export default Home;
