import React, { useState, useRef } from 'react';
import { VideoTemplate } from '../types';
import { generateVideo } from '../services/gemini';
import { Camera, Upload, Play, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const TEMPLATES: VideoTemplate[] = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Rebel',
    description: 'Transform into a neon-lit futuristic hero.',
    prompt: 'A cinematic close-up transforming into a wide shot of a cyberpunk character with neon lights reflecting on their face, standing in a rainy futuristic city, high tech armor, detailed, 8k resolution.',
    thumbnailUrl: 'https://picsum.photos/300/500?grayscale',
    aspectRatio: '9:16'
  },
  {
    id: 'fantasy',
    title: 'Elven Mage',
    description: 'Cast spells in an ancient forest.',
    prompt: 'A fantasy movie shot of a magical elven mage casting a glowing spell in an ancient forest, ethereal lighting, floating particles, majestic robes.',
    thumbnailUrl: 'https://picsum.photos/300/501?blur',
    aspectRatio: '9:16'
  },
  {
    id: 'space',
    title: 'Space Commander',
    description: 'Command a starship in deep space.',
    prompt: 'A sci-fi shot of a space commander on the bridge of a starship looking out at a nebula, futuristic uniform, dramatic lighting, lens flare.',
    thumbnailUrl: 'https://picsum.photos/300/502',
    aspectRatio: '16:9'
  },
  {
    id: 'noir',
    title: 'Noir Detective',
    description: 'Solve a mystery in 1940s black and white.',
    prompt: 'A black and white film noir scene of a detective in a trench coat walking down a foggy street under a streetlamp, moody shadows, classic cinema style.',
    thumbnailUrl: 'https://picsum.photos/300/503?grayscale',
    aspectRatio: '9:16'
  }
];

export const VideoStar: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setGeneratedVideoUrl(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !userImage) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      // API Key Check for Veo
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assuming success if we proceed, or we could check again.
        }
      }

      // Strip prefix for API
      const base64Data = userImage.split(',')[1];
      
      const blob = await generateVideo(
        selectedTemplate.prompt,
        base64Data,
        selectedTemplate.aspectRatio
      );

      const url = URL.createObjectURL(blob);
      setGeneratedVideoUrl(url);

    } catch (err: any) {
        console.error(err);
        if (err.message && err.message.includes("Requested entity was not found")) {
            setError("Session expired or invalid key. Please try again to select a key.");
             if (window.aistudio) {
                await window.aistudio.openSelectKey();
             }
        } else {
            setError(err.message || "Failed to generate video.");
        }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            FaceFame Video Star
          </h1>
          <p className="text-gray-400">Upload your selfie and star in blockbuster scenes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Template Selection */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Upload Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                1. Upload Your Selfie
              </h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  userImage ? 'border-purple-500 bg-gray-900' : 'border-gray-600 hover:border-purple-400 hover:bg-gray-700'
                }`}
              >
                {userImage ? (
                  <img src={userImage} alt="User" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-400 font-medium">Click to upload photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* 2. Template Selection */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                2. Choose a Scenario
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {TEMPLATES.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative group ${
                      selectedTemplate?.id === t.id ? 'border-pink-500 ring-2 ring-pink-500 ring-opacity-50' : 'border-transparent hover:border-gray-500'
                    }`}
                  >
                    <img src={t.thumbnailUrl} alt={t.title} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all flex flex-col justify-end p-2">
                        <span className="font-bold text-sm text-white">{t.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
             {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!userImage || !selectedTemplate || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                !userImage || !selectedTemplate || isGenerating
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transform hover:scale-[1.02]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Scene...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Generate Video
                </>
              )}
            </button>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            
            <p className="text-xs text-center text-gray-500">
                Powered by Veo. Generation may take 1-2 minutes. <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-gray-400">Billing Information</a>
            </p>

          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7 bg-black rounded-xl border border-gray-800 shadow-2xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            {generatedVideoUrl ? (
              <div className="w-full h-full flex flex-col items-center">
                 <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl"
                 />
                 <a 
                    href={generatedVideoUrl} 
                    download={`facefame-${selectedTemplate?.id}.mp4`}
                    className="mt-6 bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                 >
                    <Download className="w-5 h-5" />
                    Download Video
                 </a>
              </div>
            ) : (
              <div className="text-center text-gray-600">
                {isGenerating ? (
                   <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                      </div>
                      <p className="text-xl font-light">Creating your masterpiece...</p>
                      <p className="text-sm">Please wait, this uses advanced AI video generation.</p>
                   </div>
                ) : (
                    <>
                        <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Play className="w-16 h-16 text-gray-800 ml-2" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700">Your video will appear here</h3>
                        <p className="text-gray-500 mt-2">Select a photo and a scenario to start.</p>
                    </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};