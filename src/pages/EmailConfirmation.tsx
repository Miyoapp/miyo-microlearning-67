
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
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mt-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ¡Revisa tu email!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              Te hemos enviado un correo electrónico con un enlace de confirmación.
            </p>
            <p className="text-gray-600">
              Haz clic en el enlace del correo para activar tu cuenta y comenzar a aprender.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">¿No ves el correo?</p>
                <p>Revisa tu carpeta de spam o correo no deseado.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Link to="/login">
              <Button className="w-full bg-miyo-800 hover:bg-miyo-900">
                Ir al inicio de sesión
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
