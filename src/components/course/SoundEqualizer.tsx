
interface SoundEqualizerProps {
  icon: React.ReactNode;
  text: string;
}

const SoundEqualizer = ({ icon, text }: SoundEqualizerProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[56px] items-end gap-[3px] mb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className={`w-2 bg-gradient-to-t from-miyo-800 to-purple-400 rounded-full animate-pulse`}
            style={{ 
              height: `${Math.random() * 35 + 15}px`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.5s"
            }}
          ></div>
        ))}
      </div>
      <div className="flex items-center text-gray-600">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
};

export default SoundEqualizer;
