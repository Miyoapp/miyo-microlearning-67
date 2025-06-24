
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '../components/Header';
import HomeHero from '../components/home/HomeHero';
import CategoryCarousel from '../components/landing/CategoryCarousel';
import HowItWorks from '../components/home/HowItWorks';
import FavoriteMoments from '../components/home/FavoriteMoments';
import Footer from '../components/home/Footer';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si hay usuario autenticado, redirigir inmediatamente al dashboard
    if (user && !loading) {
      console.log('Home: Authenticated user detected, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Si hay usuario, no renderizar nada mientras redirige
  if (user) {
    return null;
  }

  // Si está cargando, mostrar un mínimo loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyo-800"></div>
      </div>
    );
  }

  // Solo renderizar el contenido público si no hay usuario autenticado
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
