import React, { useState, useRef } from 'react';
import { generateImage, editImage } from '../services/gemini';
import { ImageAspectRatio, ImageSize } from '../types';
import { Download, Wand2, Image as ImageIcon, Loader2, Edit, AlertCircle } from 'lucide-react';

type StudioMode = 'GENERATE' | 'EDIT';

export const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<StudioMode>('GENERATE');
  
  // Gen State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Edit State
  const [editImageFile, setEditImageFile] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImageResult, setEditedImageResult] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGen = async () => {
    if (!genPrompt) return;
    setIsLoading(true);
    setError(null);
    try {
        // Veo/Pro models might need key selection, though usually only Veo forces it. 
        // Just in case gemini-3-pro-image-preview needs it or we want consistency.
        if (window.aistudio) {
             const hasKey = await window.aistudio.hasSelectedApiKey();
             if(!hasKey) await window.aistudio.openSelectKey();
        }

        const res = await generateImage(genPrompt, aspectRatio, imageSize);
        setGeneratedImage(res);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editImageFile || !editPrompt) return;
    setIsLoading(true);
    setError(null);
    try {
        const base64 = editImageFile.split(',')[1];
        const res = await editImage(base64, editPrompt);
        setEditedImageResult(res);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setEditImageFile(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
            <button 
                onClick={() => setMode('GENERATE')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'GENERATE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
                <div className="flex items-center gap-2"><Wand2 className="w-4 h-4"/> Generate</div>
            </button>
            <button 
                onClick={() => setMode('EDIT')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'EDIT' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
                <div className="flex items-center gap-2"><Edit className="w-4 h-4"/> Edit</div>
            </button>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg flex items-center gap-2 text-red-200">
                <AlertCircle className="w-5 h-5"/>
                {error}
            </div>
        )}

        {mode === 'GENERATE' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-blue-400 mb-4">Pro Image Generator</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
                        <textarea 
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            placeholder="A futuristic city with flying cars, neon lights, 4k..."
                            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                            <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                            >
                                {['1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2', '21:9'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Size</label>
                            <select 
                                value={imageSize} 
                                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                            >
                                <option value="1K">1K</option>
                                <option value="2K">2K</option>
                                <option value="4K">4K</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGen}
                        disabled={isLoading || !genPrompt}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-bold transition-all flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <Wand2/>}
                        Generate
                    </button>
                    <p className="text-xs text-center text-gray-500">Uses gemini-3-pro-image-preview</p>
                </div>

                {/* Result */}
                <div className="bg-black rounded-2xl flex items-center justify-center border border-gray-800 min-h-[400px]">
                    {generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center p-2">
                            <img src={generatedImage} alt="Generated" className="max-h-[500px] max-w-full rounded-lg shadow-2xl" />
                            <a href={generatedImage} download="generated-image.png" className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="w-6 h-6"/>
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-600 flex flex-col items-center">
                            <ImageIcon className="w-16 h-16 mb-2"/>
                            <p>Image will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Edit Controls */}
                <div className="space-y-6 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-green-400 mb-4">Magic Editor</h2>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 hover:border-green-500 transition-colors"
                    >
                        {editImageFile ? (
                             <img src={editImageFile} alt="Source" className="h-full w-full object-contain rounded-lg p-1"/>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2"/>
                                <p className="text-sm text-gray-400">Upload image to edit</p>
                            </>
                        )}
                         <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Instructions</label>
                        <textarea 
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="E.g., Add a retro filter, remove the background person..."
                            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>

                    <button 
                        onClick={handleEdit}
                        disabled={isLoading || !editPrompt || !editImageFile}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition-all flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <Edit/>}
                        Apply Edit
                    </button>
                    <p className="text-xs text-center text-gray-500">Uses gemini-2.5-flash-image</p>
                </div>

                {/* Edit Result */}
                <div className="bg-black rounded-2xl flex items-center justify-center border border-gray-800 min-h-[400px]">
                    {editedImageResult ? (
                        <div className="relative group w-full h-full flex items-center justify-center p-2">
                             <img src={editedImageResult} alt="Edited" className="max-h-[500px] max-w-full rounded-lg shadow-2xl" />
                             <a href={editedImageResult} download="edited-image.png" className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="w-6 h-6"/>
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-600 flex flex-col items-center">
                            <ImageIcon className="w-16 h-16 mb-2"/>
                            <p>Edited result will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

function Upload(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
}