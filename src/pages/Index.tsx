
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeHero from '@/components/home/HomeHero';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import ValueProposition from '@/components/home/ValueProposition';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import Footer from '@/components/home/Footer';
import EnvironmentSwitcher from '@/components/admin/EnvironmentSwitcher';
import { databaseConfig } from '@/config/database';

const Index = () => {
  const navigate = useNavigate();

  // Solo mostrar el switcher en desarrollo
  const showEnvironmentSwitcher = databaseConfig.environment === 'development' || 
                                  window.location.hostname.includes('lovable.app');

  return (
    <div className="min-h-screen">
      <HomeHero />
      <FeaturedCourses />
      <ValueProposition />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
      
      {showEnvironmentSwitcher && <EnvironmentSwitcher />}
    </div>
  );
};

export default Index;
