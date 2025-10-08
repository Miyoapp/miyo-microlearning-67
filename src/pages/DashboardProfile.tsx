import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { SidebarTrigger } from '@/components/ui/sidebar/index';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCachedProfile, useUpdateProfile, useUpdatePassword } from '@/hooks/queries/useCachedProfile';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardProfile = () => {
  const isMobile = useIsMobile();
  const { data: profile, isLoading, error } = useCachedProfile();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update name when profile loads
  React.useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const handleSave = async () => {
    // Validations
    if (!name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    if (password && password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      // Update name if changed
      if (name !== profile?.name) {
        await updateProfile.mutateAsync({ name });
      }

      // Update password if provided
      if (password) {
        await updatePassword.mutateAsync({ password });
      }

      // Reset form
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(profile?.name || '');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-600">No se pudo cargar el perfil</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg">
          <SidebarTrigger />
        </div>
      )}
      
      <div className="h-full overflow-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center md:items-start space-y-4">
                    <Skeleton className="w-32 h-32 rounded-full" />
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ) : profile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center md:items-start space-y-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ''} />
                      <AvatarFallback className="text-2xl bg-miyo-100 text-miyo-800">
                        {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Profile Information */}
                  <div className="md:col-span-2 space-y-6">
                  {!isEditing ? (
                    // View Mode
                    <>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Nombre</Label>
                        <p className="mt-1 text-lg text-gray-900">{profile.name || 'Sin nombre'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Correo Electrónico</Label>
                        <p className="mt-1 text-lg text-gray-600">{profile.email || 'Sin correo'}</p>
                        <p className="text-xs text-gray-500 mt-1">El correo no puede ser modificado</p>
                      </div>

                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-miyo-700 hover:bg-miyo-800"
                      >
                        Editar Perfil
                      </Button>
                    </>
                  ) : (
                    // Edit Mode
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Correo Electrónico</Label>
                        <p className="mt-1 text-gray-600">{profile.email || 'Sin correo'}</p>
                        <p className="text-xs text-gray-500 mt-1">El correo no puede ser modificado</p>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Cambiar Contraseña (opcional)</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repetir contraseña"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button 
                          onClick={handleSave}
                          className="bg-miyo-700 hover:bg-miyo-800"
                        >
                          Guardar
                        </Button>
                        <Button 
                          onClick={handleCancel}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;
