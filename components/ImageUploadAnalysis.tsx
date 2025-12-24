
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
        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Image Risk Analysis
            </h3>

            <div
                className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-slate-500 transition-colors relative h-32 flex flex-col items-center justify-center bg-black/20"
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                ) : (
                    <div className="text-slate-500 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Click to Upload Image</p>
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

            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        "Analyze Fire Risk"
                    )}
                </button>
            )}

            {error && (
                <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
                    {error}
                </div>
            )}

            {result && (
                <div className={`p-3 rounded-lg border text-sm ${result.risk_level === 'High'
                    ? 'bg-red-500/20 border-red-500/30 text-red-200'
                    : 'bg-green-500/20 border-green-500/30 text-green-200'
                    }`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase text-[10px]">Risk Level</span>
                        <span className="font-bold text-xs">{result.risk_level}</span>
                    </div>

                    <p className="text-xs opacity-90 italic mt-2">
                        "{result.caption}"
                    </p>

                    {result.detected_keywords.length > 0 && (
                        <div className="mt-2 text-[10px] text-white/50">
                            Keywords: {result.detected_keywords.join(", ")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploadAnalysis;
