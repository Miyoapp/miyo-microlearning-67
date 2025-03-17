
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Curso no encontrado</h2>
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-miyo-800 text-white rounded-full"
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default CourseNotFound;
