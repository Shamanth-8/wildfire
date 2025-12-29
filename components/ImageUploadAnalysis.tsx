
import React, { useState, useRef } from 'react';

interface AnalysisResult {
    caption: string;
    risk_level: string;
    detected_keywords: string[];
}

const ImageUploadAnalysis: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Simulate scanning delay for effect
            await new Promise(r => setTimeout(r, 1500));
            
            const response = await fetch('http://localhost:8000/predict/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
                throw new Error(errorData.detail || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Error analyzing image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card p-5 rounded-xl border border-white/10 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.47z"/></svg>
            </div>
            
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Visual Risk Intelligence
            </h3>

            <div
                className={`relative border border-dashed rounded-lg p-0 h-40 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
                    isLoading ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-600 hover:border-slate-400 hover:bg-white/5 cursor-pointer'
                }`}
                onClick={() => !isLoading && fileInputRef.current?.click()}
            >
                {isLoading && <div className="animate-scan z-10"></div>}
                
                {previewUrl ? (
                    <div className="relative w-full h-full">
                         <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-800/50 rounded-full border border-white/5">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-wider">Upload Satellite/Drone Imagery</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {selectedFile && !result && (
                <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <span className="font-mono text-[10px] animate-pulse">ANALYZING SPECTRUM...</span>
                        </>
                    ) : (
                        "INITIATE ANALYSIS"
                    )}
                </button>
            )}

            {error && (
                <div className="text-red-400 text-[10px] font-mono bg-red-500/10 p-2 rounded border border-red-500/20 flex items-center gap-2">
                    <span className="text-red-500 text-lg">!</span> {error}
                </div>
            )}

            {result && (
                <div className={`p-4 rounded-lg border backdrop-blur-md transition-all duration-500 animate-fade-in ${result.risk_level === 'High'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <span className="text-[10px] text-slate-400 font-mono uppercase">Risk Assessment</span>
                             <div className={`text-lg font-bold ${result.risk_level === 'High' ? 'text-red-400 glow-text-orange' : 'text-green-400'}`}>
                                 {result.risk_level.toUpperCase()}
                             </div>
                        </div>
                         {result.risk_level === 'High' ? (
                             <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40 animate-pulse">
                                 <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                             </div>
                         ) : (
                             <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/40">
                                 <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             </div>
                         )}
                    </div>

                    <div className="text-xs text-slate-300 font-mono border-t border-white/5 pt-2 mt-2 leading-relaxed">
                        &gt; {result.caption}
                    </div>

                    {result.detected_keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {result.detected_keywords.map((k, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-red-500/20 text-red-300 border border-red-500/20">
                                    {k}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploadAnalysis;
