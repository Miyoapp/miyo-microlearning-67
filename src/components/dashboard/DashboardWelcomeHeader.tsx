import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardWelcomeHeaderProps {
  userName: string;
  isFirstTimeUser: boolean;
}

const DashboardWelcomeHeader: React.FC<DashboardWelcomeHeaderProps> = ({
  userName,
  isFirstTimeUser,
}) => {
  const isMobile = useIsMobile();

  const welcomeMessage = isFirstTimeUser 
    ? `¡Bienvenido(a), ${userName}!` 
    : `¡Bienvenido(a) de vuelta, ${userName}!`;

  return (
    <>
      {/* Welcome Message - Mobile */}
      {isMobile && (
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{welcomeMessage}</h1>
          <p className="text-sm text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>
      )}

      {/* Desktop Header - hidden on mobile */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{welcomeMessage}</h1>
            <p className="text-sm sm:text-base text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardWelcomeHeader;