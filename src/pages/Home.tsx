
import React from 'react';
import Header from '../components/Header';
import HomeHero from '../components/home/HomeHero';
import StaticCategoriesSection from '../components/landing/StaticCategoriesSection';
import UpdatedHowItWorksOptimized from '../components/home/UpdatedHowItWorksOptimized';
import FavoriteMomentsModern from '../components/home/FavoriteMomentsModern';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HomeHero />
      <StaticCategoriesSection />
      <UpdatedHowItWorksOptimized />
      <FavoriteMomentsModern />
      <Footer />
    </div>
  );
};

export default Home;
