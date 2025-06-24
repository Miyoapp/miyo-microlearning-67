
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';
import Logo from '@/components/common/Logo';

const RegistrationConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo />
          <div className="flex justify-center mt-4 mb-2">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ¡Registro Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-miyo-800" />
          </div>
          <p className="text-gray-600">
            Hemos enviado un correo de verificación a tu dirección de email.
          </p>
          <p className="text-sm text-gray-500">
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
          </p>
          <div className="pt-4">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            ¿No recibiste el correo? Revisa tu carpeta de spam o contacta con soporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationConfirmation;
