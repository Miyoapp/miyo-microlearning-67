import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
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

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

const DashboardProfile = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

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
      // Update name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) throw passwordError;
        toast.success('Contraseña actualizada correctamente');
      }

      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-600">Cargando perfil...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
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
                        <p className="mt-1 text-lg text-gray-900">{profile.name}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Correo Electrónico</Label>
                        <p className="mt-1 text-lg text-gray-600">{profile.email}</p>
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
                        <p className="mt-1 text-gray-600">{profile.email}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;
