
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface LessonProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled = false
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSliderChange = (values: number[]) => {
    if (disabled) return;
    const newTime = (values[0] / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className="mb-3">
      <Slider
        value={[progress]}
        onValueChange={handleSliderChange}
        max={100}
        step={0.1}
        disabled={disabled}
        className="w-full"
        // MEJORADO: Estilos para barra de progreso morada
        style={{
          '--slider-track': '#5e16ea',
          '--slider-range': '#5e16ea',
          '--slider-thumb': '#5e16ea'
        } as React.CSSProperties}
      />
    </div>
  );
};

export default LessonProgressBar;
