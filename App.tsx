import React, { useState } from 'react';
import { AppMode } from './types';
import { VideoStar } from './components/VideoStar';
import { ImageStudio } from './components/ImageStudio';
import { VoiceChat } from './components/VoiceChat';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { Video, Image, Mic, Search, Star } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VIDEO_STAR);

  const renderContent = () => {
    switch (mode) {
      case AppMode.VIDEO_STAR:
        return <VideoStar />;
      case AppMode.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppMode.VOICE_CHAT:
        return <VoiceChat />;
      case AppMode.VIDEO_ANALYZE:
        return <VideoAnalyzer />;
      default:
        return <VideoStar />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
        <div className="p-4 flex items-center justify-center md:justify-start gap-3 border-b border-gray-700 h-20">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="text-white fill-white w-6 h-6"/>
            </div>
            <span className="font-bold text-xl hidden md:block tracking-tight">FaceFame</span>
        </div>
        
        <div className="flex-1 py-6 space-y-2 px-2">
            <NavItem 
                active={mode === AppMode.VIDEO_STAR} 
                onClick={() => setMode(AppMode.VIDEO_STAR)} 
                icon={<Video />} 
                label="Video Star" 
            />
            <NavItem 
                active={mode === AppMode.IMAGE_STUDIO} 
                onClick={() => setMode(AppMode.IMAGE_STUDIO)} 
                icon={<Image />} 
                label="Image Studio" 
            />
             <NavItem 
                active={mode === AppMode.VOICE_CHAT} 
                onClick={() => setMode(AppMode.VOICE_CHAT)} 
                icon={<Mic />} 
                label="Voice Chat" 
            />
             <NavItem 
                active={mode === AppMode.VIDEO_ANALYZE} 
                onClick={() => setMode(AppMode.VIDEO_ANALYZE)} 
                icon={<Search />} 
                label="Analyze Video" 
            />
        </div>
        
        <div className="p-4 border-t border-gray-700">
            <div className="bg-gray-700/50 rounded-lg p-3 text-xs text-gray-400 hidden md:block">
                <p>Gemini Powered</p>
                <p>Veo 3 • Gemini 3 Pro</p>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

interface NavItemProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active 
                ? 'bg-purple-600/20 text-purple-300' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            <div className={`${active ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}`}>
                {icon}
            </div>
            <span className="hidden md:block font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 hidden md:block" />}
        </button>
    );
};

export default App;