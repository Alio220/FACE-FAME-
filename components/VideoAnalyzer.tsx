import React, { useState } from 'react';
import { analyzeVideo } from '../services/gemini';
import { Upload, FileVideo, Search, Loader2 } from 'lucide-react';

export const VideoAnalyzer: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!videoFile || !prompt) return;
        setLoading(true);
        try {
            const res = await analyzeVideo(videoFile, prompt);
            setResult(res);
        } catch (e: any) {
            setResult("Error analyzing video: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full p-8 overflow-y-auto bg-gray-900 flex justify-center">
            <div className="max-w-3xl w-full space-y-6">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-yellow-500">Video Intelligence</h2>
                    <p className="text-gray-400">Analyze video content with Gemini 3 Pro</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-6">
                    {/* Upload */}
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:bg-gray-750 transition-colors relative">
                        <input 
                            type="file" 
                            accept="video/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                        {videoFile ? (
                            <div className="flex flex-col items-center text-yellow-400">
                                <FileVideo className="w-12 h-12 mb-2"/>
                                <p className="font-semibold">{videoFile.name}</p>
                                <p className="text-sm text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload className="w-12 h-12 mb-2"/>
                                <p>Drop a short video here or click to upload</p>
                                <p className="text-xs mt-2 text-gray-500">Max 20MB for demo</p>
                            </div>
                        )}
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="text-sm font-medium text-gray-400 block mb-2">Question / Prompt</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            placeholder="What is happening in this video? List key events."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={!videoFile || !prompt || loading}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 rounded-lg font-bold text-white flex justify-center items-center gap-2"
                    >
                         {loading ? <Loader2 className="animate-spin"/> : <Search/>}
                         Analyze Video
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-2">Analysis Result</h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-gray-300">{result}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};