import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageViewer } from './components/ImageViewer';
import { GenerationSettings, AspectRatio, GeneratedImage, ReferenceImage, StudioMode } from './types';
import { generateImage, editImage, generateConsistentImage, generateFromReferences, extractOutfit, extractBackground, getApiKey } from './services/geminiService';
import { CONCEPT_GROUPS, FASHION_POSES, CAMERA_ANGLES, MODEL_ATTRIBUTES, ANIMAL_FACE_SHAPES } from './constants';
import { AlertCircle } from 'lucide-react';
import { OutfitExtractor } from './components/OutfitExtractor';
import { BackgroundExtractor } from './components/BackgroundExtractor';
import { ApiKeyConfig } from './components/ApiKeyConfig';

const App: React.FC = () => {
  const [settings, setSettings] = useState<GenerationSettings>({
    lensId: "rf85", // Default to 85mm f/1.2
    aspectRatio: AspectRatio.Wide, // Default 16:9 for Profile Spread
    resolution: "2K", // Default 2K for Profile Spread
    
    // Model Settings
    model: {
      gender: MODEL_ATTRIBUTES.gender[0],
      nationality: MODEL_ATTRIBUTES.nationality[0],
      age: MODEL_ATTRIBUTES.age[3], // Default to Early 20s
      height: MODEL_ATTRIBUTES.height[2], // Default to 165cm
      bodyType: MODEL_ATTRIBUTES.bodyType[0], // Default to Slender
      proportion: MODEL_ATTRIBUTES.proportion[3], // Default: Golden Ratio (황금 비율)
      shoulderWidth: MODEL_ATTRIBUTES.shoulderWidth[0], // Default: Select None
      faceShape: ANIMAL_FACE_SHAPES[0].items[0].id, // Default to Puppy
      makeup: MODEL_ATTRIBUTES.makeup[3].value // Default: Fruity/Juicy (과즙 메이크업)
    },

    // Facial Expression (0-100)
    facialExpression: 50, // Default: Gentle Smile

    // Layout Settings
    layoutMode: 'profile_spread', // Default Mode
    gridCount: 1,
    gridSizing: 'uniform',
    
    // Poses & Prompt
    cameraAngles: [CAMERA_ANGLES[0]], // Initialize with 1 random angle
    customCameraAngles: [""],
    
    poses: [FASHION_POSES[0]], // Initialize with 1 random pose
    customPoses: [""], // Initialize empty custom pose
    
    additionalPrompt: "",
    clothingPrompt: "",
    
    concept: CONCEPT_GROUPS.indoor.items[0], 
    customLocation: ""
  });

  const [mode, setMode] = useState<StudioMode>('standard');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference State
  const [modelRefs, setModelRefs] = useState<ReferenceImage[]>([]);
  const [clothingRefs, setClothingRefs] = useState<ReferenceImage[]>([]);
  const [locationRefs, setLocationRefs] = useState<ReferenceImage[]>([]);

  // Outfit Extractor State
  const [showExtractor, setShowExtractor] = useState(false);
  const [extractorSource, setExtractorSource] = useState<string | null>(null);
  const [extractorResult, setExtractorResult] = useState<string | null>(null);

  // Background Extractor State
  const [showBgExtractor, setShowBgExtractor] = useState(false);
  const [bgExtractorSource, setBgExtractorSource] = useState<string | null>(null);
  const [bgExtractorResult, setBgExtractorResult] = useState<string | null>(null);

  // API Config State - Open if no key is stored
  const [showConfig, setShowConfig] = useState<boolean>(() => !getApiKey());

  const addToHistory = (url: string, prompt: string) => {
    setHistory(prev => [{ url, prompt }, ...prev]);
  };

  const processUpload = (files: FileList | null, currentList: ReferenceImage[], setList: React.Dispatch<React.SetStateAction<ReferenceImage[]>>) => {
    if (!files) return;
    
    // Limit to max 10 total
    const remainingSlots = 10 - currentList.length;
    if (remainingSlots <= 0) {
      alert("최대 10장까지만 업로드할 수 있습니다.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setList(prev => [
          ...prev, 
          { id: Math.random().toString(36).substr(2, 9), url: result, selected: true }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleReference = (id: string, setList: React.Dispatch<React.SetStateAction<ReferenceImage[]>>) => {
    setList(prev => prev.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
  };

  const removeReference = (id: string, setList: React.Dispatch<React.SetStateAction<ReferenceImage[]>>) => {
    setList(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      let url: string;
      let historyLabel: string;
      
      const layoutLabel = settings.layoutMode === 'profile_spread' 
        ? '프로필(3면)' 
        : (settings.gridCount > 1 ? `${settings.gridCount}컷` : '단독컷');

      if (mode === 'standard') {
        url = await generateImage(settings);
        historyLabel = `[${layoutLabel}] ${settings.customLocation || settings.concept}`;
      } else {
        // Reference Mode
        const selectedModel = modelRefs.filter(r => r.selected);
        const selectedClothing = clothingRefs.filter(r => r.selected);
        const hasClothingText = settings.clothingPrompt && settings.clothingPrompt.trim().length > 0;
        
        if (selectedModel.length === 0) {
           // ALLOW Reference generation without Model images if we have Model Settings configured
           // But normally Reference Mode implies using image references.
           // User might want to generate a generated model wearing reference clothes.
           // However, to keep it simple and consistent with previous logic:
           if (selectedClothing.length === 0 && !hasClothingText && locationRefs.filter(r => r.selected).length === 0) {
             throw new Error("모델, 의상, 또는 배경 이미지를 하나 이상 선택해주세요.");
           }
        }
        
        url = await generateFromReferences(modelRefs, clothingRefs, locationRefs, settings);
        historyLabel = `[${layoutLabel}] Ref Mix: ${settings.customLocation || settings.concept}`;
      }

      setImageUrl(url);
      addToHistory(url, historyLabel);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "이미지 생성에 실패했습니다. 다시 시도해 주세요.");
      // Check for auth errors to reopen modal
      if (err.message?.includes("API Key") || err.message?.includes("403")) {
          setShowConfig(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (editPrompt: string) => {
    if (!imageUrl) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const url = await editImage(imageUrl, editPrompt, settings);
      setImageUrl(url);
      addToHistory(url, `수정: ${editPrompt}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "이미지 수정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConsistentGenerate = async (newContextPrompt: string) => {
    if (!imageUrl) return;

    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateConsistentImage(imageUrl, newContextPrompt, settings);
      setImageUrl(url);
      addToHistory(url, `다음 컷: ${newContextPrompt}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "이미지 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Outfit Extraction Logic ---
  const handleExtractOutfit = async () => {
    const selectedModels = modelRefs.filter(r => r.selected);
    if (selectedModels.length !== 1) {
      alert("의상을 추출할 모델 사진을 정확히 1장만 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const sourceImg = selectedModels[0].url;

    try {
      const resultUrl = await extractOutfit(sourceImg);
      setExtractorSource(sourceImg);
      setExtractorResult(resultUrl);
      setShowExtractor(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "의상 추출에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExtractedToRef = (url: string) => {
    setClothingRefs(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), url: url, selected: true }
    ]);
    setShowExtractor(false);
    setExtractorSource(null);
    setExtractorResult(null);
  };

  // --- Background Extraction Logic ---
  const handleExtractBackgroundFromGenerated = async (sourceUrl: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const resultUrl = await extractBackground(sourceUrl);
      setBgExtractorSource(sourceUrl);
      setBgExtractorResult(resultUrl);
      setShowBgExtractor(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "배경 추출에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExtractedBackgroundToRef = (url: string) => {
     setLocationRefs(prev => [
       ...prev,
       { id: Math.random().toString(36).substr(2, 9), url: url, selected: true }
     ]);
     setShowBgExtractor(false);
     setBgExtractorSource(null);
     setBgExtractorResult(null);
     
     // Optionally switch to Reference mode to see the added background
     if (mode !== 'reference') {
       setMode('reference');
     }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-black text-white font-sans overflow-hidden">
      
      {/* Sidebar Controls */}
      <ControlPanel 
        settings={settings}
        mode={mode}
        onModeChange={setMode}
        onUpdate={setSettings}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        
        // Reference Props
        modelRefs={modelRefs}
        clothingRefs={clothingRefs}
        locationRefs={locationRefs}
        onUploadModel={(files) => processUpload(files, modelRefs, setModelRefs)}
        onUploadClothing={(files) => processUpload(files, clothingRefs, setClothingRefs)}
        onUploadLocation={(files) => processUpload(files, locationRefs, setLocationRefs)}
        onToggleModel={(id) => toggleReference(id, setModelRefs)}
        onToggleClothing={(id) => toggleReference(id, setClothingRefs)}
        onToggleLocation={(id) => toggleReference(id, setLocationRefs)}
        onRemoveModel={(id) => removeReference(id, setModelRefs)}
        onRemoveClothing={(id) => removeReference(id, setClothingRefs)}
        onRemoveLocation={(id) => removeReference(id, setLocationRefs)}
        
        // Extraction
        onExtractOutfit={handleExtractOutfit}
        
        // Config
        onOpenConfig={() => setShowConfig(true)}
      />

      {/* Main Preview Area */}
      <main className="flex-1 relative flex flex-col h-full">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-white">&times;</button>
          </div>
        )}
        
        <ImageViewer 
          imageUrl={imageUrl} 
          isLoading={isGenerating} 
          onEdit={handleEdit}
          onConsistentGenerate={handleConsistentGenerate}
          onExtractBackground={handleExtractBackgroundFromGenerated}
          history={history}
          onSelectImage={(img) => setImageUrl(img.url)}
        />
        
        {/* Notice for First Time Users */}
        <div className="absolute bottom-4 left-4 z-30 text-[10px] text-gray-600">
           * K-아이돌 뷰티 스튜디오 (Nano Banana PRO)
        </div>
      </main>

      {/* Outfit Extraction Modal */}
      {showExtractor && extractorSource && extractorResult && (
        <OutfitExtractor 
          sourceImageUrl={extractorSource}
          initialResultUrl={extractorResult}
          onClose={() => setShowExtractor(false)}
          onAddToReferences={handleAddExtractedToRef}
        />
      )}

      {/* Background Extraction Modal */}
      {showBgExtractor && bgExtractorSource && bgExtractorResult && (
        <BackgroundExtractor 
          sourceImageUrl={bgExtractorSource}
          initialResultUrl={bgExtractorResult}
          onClose={() => setShowBgExtractor(false)}
          onAddToReferences={handleAddExtractedBackgroundToRef}
        />
      )}

      {/* API Key Config Modal */}
      {showConfig && (
        <ApiKeyConfig onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
};

export default App;