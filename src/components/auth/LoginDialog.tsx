
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that email and password fields are not empty
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor ingresa tu correo y contraseña");
      return;
    }
    
    // Simulate loading
    setIsLoading(true);
    
    // Simulate a delay for API call
    setTimeout(() => {
      // Accept any email/password combination
      // Store user data in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("company", "demo");
      localStorage.setItem("user", JSON.stringify({
        id: "demo-user-id",
        email: email,
        name: email.split('@')[0], // Generate a name from the email
        role: "usuario"
      }));
      
      toast.success("Inicio de sesión exitoso");
      onOpenChange(false);
      navigate("/company/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Iniciar sesión</DialogTitle>
          <DialogDescription>
            Accede a tu cuenta para ver los contenidos exclusivos de tu empresa.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="tu@empresa.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-miyo-800 hover:bg-miyo-900"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Ingresa cualquier correo y contraseña para acceder.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
