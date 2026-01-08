import React, { useState } from 'react';
import { Button } from './Button';
import { X, Sparkles, Wand2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { editBackground } from '../services/geminiService';

interface BackgroundExtractorProps {
  sourceImageUrl: string;
  onClose: () => void;
  onAddToReferences: (imageUrl: string) => void;
  initialResultUrl: string;
}

export const BackgroundExtractor: React.FC<BackgroundExtractorProps> = ({
  sourceImageUrl,
  onClose,
  onAddToReferences,
  initialResultUrl
}) => {
  const [resultUrl, setResultUrl] = useState<string>(initialResultUrl);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const newUrl = await editBackground(resultUrl, prompt);
      setResultUrl(newUrl);
      setPrompt("");
    } catch (e) {
      console.error(e);
      alert("이미지 수정 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <ImageIcon className="w-6 h-6" />
            <h3>배경 추출 스튜디오 (Background Extractor)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center h-full">
            
            {/* Source Image */}
            <div className="flex-1 flex flex-col items-center gap-2 max-w-sm">
              <span className="text-gray-500 text-sm font-medium">원본 사진</span>
              <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                <img src={sourceImageUrl} alt="Source" className="w-full h-auto max-h-[60vh] object-contain opacity-80" />
              </div>
            </div>

            <ArrowRight className="hidden md:block text-gray-600" size={32} />

            {/* Result Image */}
            <div className="flex-1 flex flex-col items-center gap-2 max-w-sm w-full">
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                <Sparkles size={14} /> 추출된 배경 (인물 제거됨)
              </span>
              <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-gray-800 min-h-[300px] flex items-center justify-center w-full">
                {isProcessing ? (
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                     <span className="text-xs text-emerald-300 animate-pulse">AI 작업 중...</span>
                   </div>
                ) : (
                   <img src={resultUrl} alt="Extracted Background" className="w-full h-auto max-h-[60vh] object-contain" />
                )}
              </div>

              {/* Edit Controls */}
              <div className="w-full mt-4 bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder="예: 조명을 더 어둡게, 창문 밖 풍경 변경..."
                     className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                     onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                   />
                   <button 
                     onClick={handleEdit}
                     disabled={isProcessing || !prompt.trim()}
                     className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg disabled:opacity-50 transition-colors"
                   >
                     <Wand2 size={18} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onAddToReferences(resultUrl)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            <ImageIcon size={18} />
            배경 레퍼런스로 추가
          </Button>
        </div>
      </div>
    </div>
  );
};