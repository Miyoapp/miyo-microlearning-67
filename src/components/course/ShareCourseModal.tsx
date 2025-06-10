
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share, Link } from 'lucide-react';
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

  const shareOnTwitter = () => {
    const text = `¡Mira este curso increíble! ${courseTitle}\n\n${courseUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
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
            onClick={shareOnTwitter}
          >
            <span className="w-4 h-4 mr-2 text-blue-400">🐦</span>
            Compartir en X (Twitter)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCourseModal;
