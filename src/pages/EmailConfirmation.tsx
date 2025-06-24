
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import Logo from '@/components/common/Logo';

const EmailConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo />
          <div className="flex justify-center mb-4 mt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ¡Revisa tu correo!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              Hemos enviado un enlace de confirmación a tu correo electrónico.
            </p>
            <p className="text-sm text-gray-500">
              Para completar tu registro, haz clic en el enlace que encontrarás en el correo.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Revisa también tu carpeta de spam</span>
          </div>
          
          <div className="pt-4">
            <Link to="/login">
              <Button 
                variant="outline" 
                className="w-full border-miyo-800 text-miyo-800 hover:bg-miyo-50"
              >
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-miyo-800 hover:underline"
            >
              Ir al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
