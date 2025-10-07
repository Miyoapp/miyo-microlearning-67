
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Crown, ExternalLink, Clock, Headphones, GraduationCap } from 'lucide-react';
import { Podcast } from '@/types';
import CourseVoting from './CourseVoting';
import CheckoutModal from './CheckoutModal';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { cn } from '@/lib/utils';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import { getOptimizedCloudinaryUrl, CloudinaryPresets } from '@/utils/cloudinary';

interface CourseHeaderProps {
  podcast: Podcast;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage?: number;
  onStartLearning: () => void;
  onToggleSave: () => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  podcast,
  hasStarted,
  isSaved,
  progressPercentage = 0,
  onStartLearning,
  onToggleSave
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const { hasPurchased, refetch } = useCoursePurchases();
  
  const isCompleted = progressPercentage >= 100;
  const isPremium = podcast.tipo_curso === 'pago';
  const hasAccess = !isPremium || hasPurchased(podcast.id);

  const handleStartLearning = () => {
    if (isPremium && !hasAccess) {
      setShowCheckout(true);
    } else {
      onStartLearning();
    }
  };

  const handlePurchaseComplete = () => {
    refetch();
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const linkedinUrl = podcast.creator?.linkedinUrl;
    if (linkedinUrl) {
      window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getButtonText = () => {
    if (isPremium && !hasAccess) {
      return `Desbloquear por ${formatCurrency(podcast.precio || 0, podcast.moneda)}`;
    }
    if (isCompleted) {
      return 'Repasar Curso';
    }
    if (hasStarted) {
      return 'Continuar Aprendiendo';
    }
    return 'Comenzar a Aprender';
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || 'USD';
    switch (curr) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'MXN':
        return `$${amount.toFixed(2)} MXN`;
      case 'ARS':
        return `$${amount.toFixed(0)} ARS`;
      case 'PEN':
        return `S/${amount.toFixed(2)}`;
      default:
        return `${curr} $${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 mx-4 sm:mx-0">
      {/* Course Image - Mobile optimized */}
      <div className="relative mb-4 sm:mb-6">
        <img
          src={getOptimizedCloudinaryUrl(podcast.imageUrl, CloudinaryPresets.CARD_IMAGE)}
          alt={podcast.title}
          className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl"
        />
        {isPremium && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
              <Crown className="w-3 h-3 sm:w-3 sm:h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
      </div>

      {/* Title and Save Button - Mobile layout */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
        <h1 className="text-lg sm:text-2xl font-bold flex-1 leading-tight">{podcast.title}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSave}
          className={cn(
            "flex-shrink-0 h-8 sm:h-9 px-2 sm:px-3",
            isSaved ? 'text-red-600 border-red-200' : ''
          )}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{isSaved ? 'Guardado' : 'Guardar'}</span>
        </Button>
      </div>

      {/* Creator Info and Category - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div
          className={cn(
            "flex items-center gap-2",
            podcast.creator?.linkedinUrl && "cursor-pointer hover:opacity-80 transition-opacity"
          )}
          onClick={podcast.creator?.linkedinUrl ? handleCreatorClick : undefined}
        >
          <img
            src={getOptimizedCloudinaryUrl(podcast.creator?.imageUrl || '/placeholder.svg', CloudinaryPresets.AVATAR)}
            alt={podcast.creator?.name || 'Autor desconocido'}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-sm sm:text-base text-gray-600">{podcast.creator?.name || 'Autor desconocido'}</span>
          {podcast.creator?.linkedinUrl && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )}
        </div>
        <Badge variant="outline" className="text-xs sm:text-sm w-fit">{podcast.category?.nombre || 'Sin categoría'}</Badge>
      </div>

      {/* Course Description - Mobile optimized */}
      <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed line-clamp-3 sm:line-clamp-none">
        {podcast.description}
      </p>

      {/* Course Stats - Mobile responsive layout */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-4">
        {isPremium ? (
          <>
            <span className="text-lg sm:text-2xl font-bold text-green-600">
              {formatCurrency(podcast.precio || 0, podcast.moneda)}
            </span>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{podcast.lessonCount} lecciones</span>
            </div>
            {podcast.nivel && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{podcast.nivel}</span>
              </div>
            )}
            <div className="w-full sm:w-auto">
              <CourseVoting courseId={podcast.id} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{podcast.lessonCount} lecciones</span>
            </div>
            {podcast.nivel && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{podcast.nivel}</span>
              </div>
            )}
            <div className="w-full sm:w-auto">
              <CourseVoting courseId={podcast.id} />
            </div>
          </>
        )}
      </div>

      {/* Action Button - Mobile optimized */}
      <Button 
        onClick={handleStartLearning} 
        size="lg" 
        className="w-full h-12 sm:h-11 text-sm sm:text-base font-medium"
      >
        <Play className="w-4 h-4 mr-2" />
        {getButtonText()}
      </Button>

      {/* Checkout Modal */}
      {isPremium && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          course={{
            id: podcast.id,
            title: podcast.title,
            precio: podcast.precio || 0,
            imageUrl: podcast.imageUrl,
            moneda: podcast.moneda || 'USD'
          }}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};

export default CourseHeader;
