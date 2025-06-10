
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share, Link, Mail } from 'lucide-react';
import { Podcast } from '@/types';

interface ShareCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Podcast;
}

const ShareCourseModal: React.FC<ShareCourseModalProps> = ({ isOpen, onClose, course }) => {
  const courseUrl = `${window.location.origin}/dashboard/course/${course.id}`;
  const courseTitle = course.title;
  const courseDescription = course.description;
  const courseImage = course.imageUrl;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(courseUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const shareOnWhatsApp = () => {
    const text = `¡Mira este curso increíble! ${courseTitle}\n\n${courseDescription}\n\n${courseUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't support direct sharing with URL, so we copy the content
    const text = `¡Mira este curso increíble! ${courseTitle}\n\n${courseDescription}\n\n${courseUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Contenido copiado. Pégalo en Instagram Stories');
      window.open('https://www.instagram.com/', '_blank');
    });
  };

  const shareOnTwitter = () => {
    const text = `¡Mira este curso increíble! ${courseTitle}\n\n${courseUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(courseUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareByEmail = () => {
    const subject = `Te recomiendo este curso: ${courseTitle}`;
    const body = `¡Hola!\n\nTe quiero recomendar este curso que me parece muy interesante:\n\n${courseTitle}\n\n${courseDescription}\n\nPuedes verlo aquí: ${courseUrl}\n\n¡Espero que te guste!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Compartir curso
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={copyToClipboard}
          >
            <Link className="w-4 h-4 mr-2" />
            Copiar enlace
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareOnWhatsApp}
          >
            <span className="w-4 h-4 mr-2 text-green-600">📱</span>
            Compartir en WhatsApp
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareOnInstagram}
          >
            <span className="w-4 h-4 mr-2 text-pink-600">📷</span>
            Compartir en Instagram
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareOnTwitter}
          >
            <span className="w-4 h-4 mr-2 text-blue-400">🐦</span>
            Compartir en X (Twitter)
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareOnLinkedIn}
          >
            <span className="w-4 h-4 mr-2 text-blue-600">💼</span>
            Compartir en LinkedIn
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={shareByEmail}
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar por correo electrónico
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCourseModal;
