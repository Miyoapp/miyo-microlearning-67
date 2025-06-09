
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Crown, ExternalLink, Clock, Headphones } from 'lucide-react';
import { Podcast } from '@/types';
import CourseVoting from './CourseVoting';
import CheckoutModal from './CheckoutModal';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { cn } from '@/lib/utils';
import { formatMinutesToHumanReadable } from '@/lib/formatters';

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
    if (podcast.creator.linkedin_url) {
      window.open(podcast.creator.linkedin_url, '_blank', 'noopener,noreferrer');
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
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Course Image */}
        <div className="relative">
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full lg:w-48 h-48 object-cover rounded-xl"
          />
          {isPremium && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{podcast.title}</h1>
              
              {/* Creator Info - reorganized and clickeable */}
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    podcast.creator.linkedin_url && "cursor-pointer hover:opacity-80 transition-opacity"
                  )}
                  onClick={podcast.creator.linkedin_url ? handleCreatorClick : undefined}
                >
                  <img
                    src={podcast.creator.imageUrl}
                    alt={podcast.creator.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-600">{podcast.creator.name}</span>
                  {podcast.creator.linkedin_url && (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <Badge variant="outline">{podcast.category.nombre}</Badge>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSave}
              className={isSaved ? 'text-red-600 border-red-200' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Guardado' : 'Guardar'}
            </Button>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-3">{podcast.description}</p>

          {/* Course Stats - Layout according to image */}
          <div className="flex items-center gap-6 mb-4">
            {isPremium ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(podcast.precio || 0, podcast.moneda)}
                </span>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                  <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
                  <span>{podcast.lessonCount} lecciones</span>
                </div>
                <CourseVoting courseId={podcast.id} />
              </>
            ) : (
              <>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Headphones className="w-4 h-4 mr-1" />
                  <span>{podcast.lessonCount} lecciones</span>
                </div>
                <CourseVoting courseId={podcast.id} />
              </>
            )}
          </div>

          {/* Progress bar for started courses */}
          {hasStarted && hasAccess && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button onClick={handleStartLearning} size="lg" className="w-full lg:w-auto">
            <Play className="w-4 h-4 mr-2" />
            {getButtonText()}
          </Button>
        </div>
      </div>

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
