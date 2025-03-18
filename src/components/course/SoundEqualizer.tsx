
interface SoundEqualizerProps {
  icon: React.ReactNode;
  text: string;
}

const SoundEqualizer = ({ icon, text }: SoundEqualizerProps) => {
  return (
    <div className="flex items-center text-gray-600">
      {icon}
      <span>{text}</span>
    </div>
  );
};

export default SoundEqualizer;
