import React from 'react';
import { GenerationSettings, ReferenceImage, StudioMode, GridCount, AspectRatio } from '../types';
import { ASPECT_RATIOS, CONCEPT_GROUPS, RESOLUTIONS, GRID_OPTIONS, GRID_SIZING_OPTIONS, FASHION_POSES, CAMERA_ANGLES, MODEL_ATTRIBUTES, ANIMAL_FACE_SHAPES } from '../constants';
import { LensSelector } from './LensSelector';
import { Button } from './Button';
import { Sparkles, Ratio, Zap, Monitor, MapPin, Camera, User, Shirt, Plus, X, LayoutTemplate, Grid, Layers, ScanEye, MessageSquarePlus, Scissors, Settings, RotateCcw, Palette, Users, Image as ImageIcon } from 'lucide-react';

interface ControlPanelProps {
  settings: GenerationSettings;
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onUpdate: (newSettings: GenerationSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  
  // Reference Props
  modelRefs: ReferenceImage[];
  clothingRefs: ReferenceImage[];
  locationRefs?: ReferenceImage[]; // Made optional to support backward compatibility in type if needed, but App provides it
  onUploadModel: (files: FileList | null) => void;
  onUploadClothing: (files: FileList | null) => void;
  onUploadLocation?: (files: FileList | null) => void;
  onToggleModel: (id: string) => void;
  onToggleClothing: (id: string) => void;
  onToggleLocation?: (id: string) => void;
  onRemoveModel: (id: string) => void;
  onRemoveClothing: (id: string) => void;
  onRemoveLocation?: (id: string) => void;
  
  // Extraction Props
  onExtractOutfit?: () => void;
  
  // Config Props
  onOpenConfig?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  mode,
  onModeChange,
  onUpdate, 
  onGenerate, 
  isGenerating,
  modelRefs,
  clothingRefs,
  locationRefs = [],
  onUploadModel,
  onUploadClothing,
  onUploadLocation,
  onToggleModel,
  onToggleClothing,
  onToggleLocation,
  onRemoveModel,
  onRemoveClothing,
  onRemoveLocation,
  onExtractOutfit,
  onOpenConfig
}) => {
  
  // Helper for Face Shape Logic
  const currentFaceShapeId = settings.model.faceShape;
  const currentFaceGroup = ANIMAL_FACE_SHAPES.find(g => g.items.some(i => i.id === currentFaceShapeId)) || ANIMAL_FACE_SHAPES[0];
  // Cast to any to access the new descriptionKo property if types aren't fully updated yet, or rely on JS flexibility
  const currentFaceItem = (currentFaceGroup.items.find(i => i.id === currentFaceShapeId) || currentFaceGroup.items[0]) as any;

  // Helper for Makeup Logic
  const currentMakeup = MODEL_ATTRIBUTES.makeup.find(m => m.value === settings.model.makeup) || MODEL_ATTRIBUTES.makeup[0];

  const handleFaceCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const newGroup = ANIMAL_FACE_SHAPES.find(g => g.category === newCategory);
    if (newGroup && newGroup.items.length > 0) {
      handleModelUpdate('faceShape', newGroup.items[0].id);
    }
  };

  const handleLensChange = (lensId: string) => {
    onUpdate({ ...settings, lensId });
  };

  const handleConceptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ 
      ...settings, 
      concept: e.target.value, 
      customLocation: "" 
    });
  };

  const handleGridChange = (count: GridCount) => {
    // Resize poses and angles arrays based on new count
    const newPoses = Array(count).fill(FASHION_POSES[0]); 
    const newCustomPoses = Array(count).fill("");
    const newAngles = Array(count).fill(CAMERA_ANGLES[0]);
    const newCustomAngles = Array(count).fill("");

    for (let i = 0; i < Math.min(count, settings.poses.length); i++) {
      newPoses[i] = settings.poses[i];
      newCustomPoses[i] = settings.customPoses[i] || "";
      if (settings.cameraAngles && settings.cameraAngles[i]) {
        newAngles[i] = settings.cameraAngles[i];
      }
      if (settings.customCameraAngles && settings.customCameraAngles[i]) {
        newCustomAngles[i] = settings.customCameraAngles[i];
      }
    }
    
    onUpdate({
      ...settings,
      layoutMode: 'grid', // Ensure we are in grid mode
      gridCount: count,
      poses: newPoses,
      customPoses: newCustomPoses,
      cameraAngles: newAngles,
      customCameraAngles: newCustomAngles
    });
  };
  
  const handleProfileModeSelect = () => {
      onUpdate({
          ...settings,
          layoutMode: 'profile_spread',
          aspectRatio: AspectRatio.Wide, // Force 16:9
          resolution: "2K", // Force 2K
      });
  };

  const handleResetPosesAngles = () => {
    const count = settings.gridCount;
    onUpdate({
      ...settings,
      poses: Array(count).fill(FASHION_POSES[0]), // Reset to Random
      customPoses: Array(count).fill(""),         // Clear inputs
      cameraAngles: Array(count).fill(CAMERA_ANGLES[0]), // Reset to Random
      customCameraAngles: Array(count).fill(""),  // Clear inputs
      additionalPrompt: "" // Clear override prompt
    });
  };

  const handleResetModelSettings = () => {
    onUpdate({
      ...settings,
      model: {
        gender: MODEL_ATTRIBUTES.gender[0],
        nationality: MODEL_ATTRIBUTES.nationality[0],
        age: MODEL_ATTRIBUTES.age[3], // 20대 초반 (Early 20s)
        height: MODEL_ATTRIBUTES.height[2], // 165cm 평균
        bodyType: MODEL_ATTRIBUTES.bodyType[0], // 슬림형
        proportion: MODEL_ATTRIBUTES.proportion[0], // 선택 안 함
        shoulderWidth: MODEL_ATTRIBUTES.shoulderWidth[0], // 선택 안 함
        faceShape: ANIMAL_FACE_SHAPES[0].items[0].id, // puppy
        makeup: MODEL_ATTRIBUTES.makeup[0].value // K-Pop 아이돌
      }
    });
  };

  const handlePoseChange = (index: number, value: string) => {
    const newPoses = [...settings.poses];
    newPoses[index] = value;
    onUpdate({ ...settings, poses: newPoses });
  };

  const handleCustomPoseChange = (index: number, value: string) => {
    const newCustomPoses = [...settings.customPoses];
    newCustomPoses[index] = value;
    onUpdate({ ...settings, customPoses: newCustomPoses });
  };

  const handleAngleChange = (index: number, value: string) => {
    const newAngles = [...settings.cameraAngles];
    newAngles[index] = value;
    onUpdate({ ...settings, cameraAngles: newAngles });
  };

  const handleCustomAngleChange = (index: number, value: string) => {
    const newCustomAngles = [...settings.customCameraAngles];
    newCustomAngles[index] = value;
    onUpdate({ ...settings, customCameraAngles: newCustomAngles });
  };
  
  const handleModelUpdate = (key: keyof typeof settings.model, value: string) => {
    onUpdate({
      ...settings,
      model: {
        ...settings.model,
        [key]: value
      }
    });
  };

  const FileInput = ({ id, onChange, label, icon: Icon }: any) => (
    <div className="relative">
      <input
        type="file"
        id={id}
        multiple
        accept="image/*"
        onChange={(e) => onChange && onChange(e.target.files)}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="flex items-center justify-center gap-2 w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 border-dashed rounded-lg cursor-pointer transition-all"
      >
        <Icon size={18} className="text-gray-400" />
        <span className="text-sm text-gray-300 font-medium">{label}</span>
      </label>
    </div>
  );

  const ReferenceGrid = ({ items, onToggle, onRemove, title }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title} ({items.length}/10)</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-gray-600 text-center py-4 bg-gray-900/50 rounded-lg">
          이미지를 업로드해주세요
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {items.map((img: ReferenceImage) => (
            <div 
              key={img.id} 
              className={`relative aspect-square group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${img.selected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-700 opacity-60 hover:opacity-100'}`}
              onClick={() => onToggle && onToggle(img.id)}
            >
              <img src={img.url} className="w-full h-full object-cover" alt="ref" />
              {img.selected && (
                <div className="absolute inset-0 bg-rose-500/20 pointer-events-none" />
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove(img.id);
                }}
                className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const selectedModelCount = modelRefs.filter(r => r.selected).length;
  const selectedClothingCount = clothingRefs.filter(r => r.selected).length;
  const selectedLocationCount = locationRefs.filter(r => r.selected).length;
  const hasClothingText = settings.clothingPrompt && settings.clothingPrompt.trim().length > 0;
  
  const canGenerateReference = mode === 'reference' 
    ? (selectedModelCount > 0 || (selectedClothingCount > 0 || hasClothingText || selectedLocationCount > 0)) 
    : true;

  const canExtract = selectedModelCount === 1;

  const isProfileMode = settings.layoutMode === 'profile_spread';

  // --- REUSABLE SECTIONS ---

  const AspectRatioSection = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-300 font-semibold">
        <Ratio size={18} />
        <h3>화면 비율</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            disabled={isProfileMode}
            onClick={() => onUpdate({ ...settings, aspectRatio: ratio.value })}
            className={`text-xs py-2 px-3 rounded-lg border transition-colors
              ${settings.aspectRatio === ratio.value 
                ? 'bg-rose-500 text-white border-rose-600' 
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}
              ${isProfileMode ? 'opacity-50 cursor-not-allowed' : ''}
              `}
          >
            {ratio.label}
          </button>
        ))}
      </div>
      {isProfileMode && (
         <p className="text-[10px] text-gray-500 px-1">* 프로필 사진 모드에서는 16:9 비율로 고정됩니다.</p>
      )}
    </div>
  );

  const ResolutionSection = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-300 font-semibold">
        <Monitor size={18} />
        <h3>해상도</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {RESOLUTIONS.map((res) => (
          <button
            key={res.value}
            disabled={isProfileMode}
            onClick={() => onUpdate({ ...settings, resolution: res.value })}
            className={`text-xs py-2 px-3 rounded-lg border transition-colors
              ${settings.resolution === res.value 
                ? 'bg-rose-500 text-white border-rose-600' 
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}
              ${isProfileMode ? 'opacity-50 cursor-not-allowed' : ''}
              `}
          >
            {res.label}
          </button>
        ))}
      </div>
      {isProfileMode && (
         <p className="text-[10px] text-gray-500 px-1">* 프로필 사진 모드에서는 2K 화질로 고정됩니다.</p>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 border-r border-gray-800 h-full flex flex-col w-full md:w-[400px] overflow-y-auto">
      
      {/* App Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-400 tracking-tight">
              K-아이돌 뷰티
            </h1>
            <p className="text-gray-500 text-sm mt-1">Nano Banana PRO</p>
          </div>
          {onOpenConfig && (
            <button 
              onClick={onOpenConfig}
              className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="API Key 설정"
            >
              <Settings size={18} />
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-gray-800/50 p-1 rounded-xl mb-4">
          <button
            onClick={() => onModeChange('standard')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all
              ${mode === 'standard' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Camera size={16} />
            기본 스튜디오
          </button>
          <button
            onClick={() => {
              onModeChange('reference');
              if (settings.layoutMode === 'profile_spread') {
                handleGridChange(1);
              }
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all
              ${mode === 'reference' ? 'bg-rose-900/40 text-rose-200 shadow-md border border-rose-900/50' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutTemplate size={16} />
            레퍼런스 믹스
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-8 flex-1 overflow-y-auto">

        {/* --- GLOBAL SETTINGS (Moved Top for Reference Mode) --- */}
        {mode === 'reference' && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-300 space-y-8">
            {AspectRatioSection}
            {ResolutionSection}
            <hr className="border-gray-800" />
          </div>
        )}
        
        {/* --- STANDARD MODE CONTENT --- */}
        {mode === 'standard' && (
          <>
            <LensSelector selectedLensId={settings.lensId} onSelect={handleLensChange} />
          </>
        )}

        {/* --- REFERENCE MODE CONTENT --- */}
        {mode === 'reference' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* 1. Model Reference */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
                <User size={18} />
                <h3>모델 레퍼런스</h3>
              </div>
              <FileInput id="upload-model" onChange={onUploadModel} label="모델 사진 추가 (최대 10장)" icon={Plus} />
              <ReferenceGrid 
                title="선택된 모델 이미지" 
                items={modelRefs} 
                onToggle={onToggleModel} 
                onRemove={onRemoveModel} 
              />
              
              {/* Extract Outfit Button */}
              {onExtractOutfit && (
                 <button
                   onClick={onExtractOutfit}
                   disabled={!canExtract || isGenerating}
                   className={`w-full py-2.5 mt-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all
                     ${canExtract 
                       ? 'bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-900/50' 
                       : 'bg-gray-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed'}`}
                 >
                   <Scissors size={14} />
                   이 모델에서 의상만 추출 (상품 컷 생성)
                 </button>
              )}
            </div>

            {/* 2. Clothing Reference */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
                <Shirt size={18} />
                <h3>의상 레퍼런스</h3>
              </div>
              <FileInput id="upload-clothing" onChange={onUploadClothing} label="의상 사진 추가 (최대 10장)" icon={Plus} />
              <ReferenceGrid 
                title="선택된 의상 이미지" 
                items={clothingRefs} 
                onToggle={onToggleClothing} 
                onRemove={onRemoveClothing} 
              />
              <div className="pt-2">
                 <input
                   type="text"
                   value={settings.clothingPrompt || ""}
                   onChange={(e) => onUpdate({...settings, clothingPrompt: e.target.value})}
                   placeholder="의상 사진이 없다면 텍스트로 설명 (예: 빨간 드레스)"
                   className="w-full bg-black/40 border border-purple-500/30 text-white text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-3 placeholder-gray-500"
                 />
              </div>
            </div>

            {/* 3. Location/Background Reference */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <ImageIcon size={18} />
                <h3>장소/배경 레퍼런스</h3>
              </div>
              <FileInput id="upload-location" onChange={onUploadLocation} label="배경 사진 추가 (최대 10장)" icon={Plus} />
              <ReferenceGrid 
                title="선택된 배경 이미지" 
                items={locationRefs} 
                onToggle={onToggleLocation} 
                onRemove={onRemoveLocation} 
              />
              <div className="pt-2 px-1">
                  <p className="text-[10px] text-gray-500 mb-1">
                    * 배경 이미지가 선택되면 아래의 '장소/배경' 텍스트 설정보다 이미지가 우선 적용됩니다.
                  </p>
              </div>
            </div>
          </div>
        )}

        {/* --- SHARED CONTROLS --- */}
        <hr className="border-gray-800" />

        {/* Aspect Ratio & Resolution (Standard Mode placement) */}
        {mode === 'standard' && (
           <>
             {AspectRatioSection}
             {ResolutionSection}
           </>
        )}

        {/* --- NEW MODEL SETTINGS --- */}
        {mode === 'standard' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300 font-semibold">
              <User size={18} />
              <h3>모델 캐릭터 설정</h3>
            </div>
            <button 
              onClick={handleResetModelSettings}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
              title="모델 설정 초기화"
            >
              <RotateCcw size={12} />
              초기화
            </button>
          </div>
          
          <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800 space-y-3">
            {/* Row 1: Gender & Nationality */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">성별</label>
                <select 
                  value={settings.model.gender} 
                  onChange={(e) => handleModelUpdate('gender', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.gender.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">국적/인종</label>
                <select 
                  value={settings.model.nationality} 
                  onChange={(e) => handleModelUpdate('nationality', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.nationality.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Age, Height */}
            <div className="grid grid-cols-2 gap-2">
               <div>
                <label className="text-[10px] text-gray-500 mb-1 block">나이</label>
                <select 
                  value={settings.model.age} 
                  onChange={(e) => handleModelUpdate('age', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.age.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">키 (신장)</label>
                <select 
                  value={settings.model.height} 
                  onChange={(e) => handleModelUpdate('height', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.height.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            
            {/* Row 3: Body Type (Full Width) */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">체형 (Body Type)</label>
              <select 
                value={settings.model.bodyType} 
                onChange={(e) => handleModelUpdate('bodyType', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
              >
                {MODEL_ATTRIBUTES.bodyType.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Row 4: Proportion & Shoulders */}
            <div className="grid grid-cols-2 gap-2">
               <div>
                <label className="text-[10px] text-gray-500 mb-1 block">비율 (Proportion)</label>
                <select 
                  value={settings.model.proportion} 
                  onChange={(e) => handleModelUpdate('proportion', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.proportion.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">어깨 너비 (Shoulders)</label>
                <select 
                  value={settings.model.shoulderWidth} 
                  onChange={(e) => handleModelUpdate('shoulderWidth', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
                >
                  {MODEL_ATTRIBUTES.shoulderWidth.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Row 5: Face Shape (Two-Step Selection) */}
            <div className="border-t border-gray-700/50 pt-3 mt-1">
              <label className="text-[10px] text-rose-300 font-bold mb-2 block flex items-center gap-1">
                 <Sparkles size={10} /> 동물상 (얼굴형) 설정
              </label>
              
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">1. 이미지 계열 선택</label>
                  <select 
                    value={currentFaceGroup.category} 
                    onChange={handleFaceCategoryChange}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2 focus:border-rose-500 transition-colors"
                  >
                    {ANIMAL_FACE_SHAPES.map(group => (
                      <option key={group.category} value={group.category}>{group.category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">2. 상세 동물상 선택</label>
                  <select 
                    value={currentFaceShapeId} 
                    onChange={(e) => handleModelUpdate('faceShape', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2 focus:border-rose-500 transition-colors"
                  >
                    {currentFaceGroup.items.map(item => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description Box */}
                <div className="mt-2 p-2 bg-black/20 rounded border border-gray-700/50">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    <span className="text-rose-400/80 font-semibold mr-1">특징:</span>
                    {currentFaceItem.descriptionKo}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 6: Makeup */}
             <div className="pt-2">
              <label className="text-[10px] text-gray-500 mb-1 block flex items-center gap-1">
                 <Palette size={10} /> 메이크업 / 스타일링
              </label>
              <select 
                value={settings.model.makeup} 
                onChange={(e) => handleModelUpdate('makeup', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2"
              >
                {MODEL_ATTRIBUTES.makeup.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

               {/* Makeup Description Box */}
               <div className="mt-2 p-2 bg-black/20 rounded border border-gray-700/50">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    <span className="text-purple-400/80 font-semibold mr-1">스타일 특징:</span>
                    {currentMakeup.description}
                  </p>
               </div>
            </div>

          </div>
        </div>
        )}

        {/* Concepts & Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300 font-semibold">
            <MapPin size={18} />
            <h3>장소 / 배경</h3>
          </div>
          
          <div className="relative">
            <select 
              value={settings.concept}
              onChange={handleConceptChange}
              disabled={!!settings.customLocation}
              className={`w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-3 transition-opacity ${settings.customLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
               <optgroup label={CONCEPT_GROUPS.indoor.label}>
                 {CONCEPT_GROUPS.indoor.items.map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </optgroup>
               <optgroup label={CONCEPT_GROUPS.outdoor.label}>
                 {CONCEPT_GROUPS.outdoor.items.map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </optgroup>
            </select>
          </div>

          <div className="relative">
             <input
                type="text"
                value={settings.customLocation}
                onChange={(e) => onUpdate({...settings, customLocation: e.target.value})}
                placeholder="장소 직접 입력 (예: 런웨이, 침실)"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-3 placeholder-gray-500"
             />
          </div>
        </div>

        {/* Output Format (Grid Layout) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300 font-semibold">
            <Grid size={18} />
            <h3>출력 형태</h3>
          </div>
          
          {/* Main Layout Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-2">
             <button
               onClick={handleProfileModeSelect}
               className={`py-3 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all
                 ${isProfileMode 
                   ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30' 
                   : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'}`}
             >
               <Users size={16} />
               프로필 사진
             </button>
             <button
               onClick={() => handleGridChange(1)}
               className={`py-3 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all
                 ${!isProfileMode 
                   ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/30' 
                   : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
             >
               <Grid size={16} />
               분할 컷 / 단독 컷
             </button>
          </div>

          {!isProfileMode && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-3 gap-2">
                {GRID_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleGridChange(opt.value)}
                    className={`text-xs py-2 px-1 rounded-lg border transition-colors
                      ${settings.gridCount === opt.value 
                        ? 'bg-purple-500 text-white border-purple-600' 
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              {/* Sizing Option (Only if grid > 1) */}
              {settings.gridCount > 1 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {GRID_SIZING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdate({ ...settings, gridSizing: opt.value })}
                      className={`text-xs py-2 px-2 rounded-lg border transition-colors flex items-center justify-center gap-2
                        ${settings.gridSizing === opt.value 
                          ? 'bg-indigo-600 text-white border-indigo-500' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                    >
                      <Layers size={12} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Pose & Angle Selection Per Cut */}
        {!isProfileMode && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300 font-semibold">
                <Zap size={18} />
                <h3>포즈 및 앵글 설정 ({settings.gridCount}컷)</h3>
              </div>
              <button 
                onClick={handleResetPosesAngles}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
                title="모든 포즈/앵글 설정 초기화"
              >
                <RotateCcw size={12} />
                초기화
              </button>
            </div>

            <div className="space-y-4">
              {Array.from({ length: settings.gridCount }).map((_, idx) => (
                  <div key={idx} className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50">
                      <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-900/30 border border-rose-800">
                          {settings.gridCount > 1 ? `CUT #${idx + 1}` : 'MAIN CUT'}
                      </span>
                    </div>

                    {/* Angle Row */}
                    <div className="space-y-1 mb-3">
                      <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1 font-medium">
                        <ScanEye size={10} />
                        카메라 앵글 (구도)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={settings.cameraAngles[idx] || CAMERA_ANGLES[0]}
                          onChange={(e) => handleAngleChange(idx, e.target.value)}
                          className={`w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 ${settings.customCameraAngles[idx] ? 'opacity-40' : ''}`}
                        >
                            {CAMERA_ANGLES.map(angle => (
                              <option key={angle} value={angle}>{angle}</option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={settings.customCameraAngles[idx] || ""}
                          onChange={(e) => handleCustomAngleChange(idx, e.target.value)}
                          placeholder="직접 입력"
                          className="w-full bg-black/40 border border-gray-700 text-white text-xs rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 placeholder-gray-600"
                        />
                      </div>
                    </div>

                    {/* Pose Row */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1 font-medium">
                        <User size={10} />
                        포즈 / 동작
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={settings.poses[idx] || FASHION_POSES[0]}
                          onChange={(e) => handlePoseChange(idx, e.target.value)}
                          className={`w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 ${settings.customPoses[idx] ? 'opacity-40' : ''}`}
                        >
                            {FASHION_POSES.map(pose => (
                              <option key={pose} value={pose}>{pose}</option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={settings.customPoses[idx] || ""}
                          onChange={(e) => handleCustomPoseChange(idx, e.target.value)}
                          placeholder="직접 입력"
                          className="w-full bg-black/40 border border-gray-700 text-white text-xs rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 placeholder-gray-600"
                        />
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Prompt (Always visible) */}
        <div className="mt-4 pt-4 border-t border-gray-800">
           <label className="text-xs text-rose-400 font-bold ml-1 mb-2 flex items-center gap-1">
             <MessageSquarePlus size={14} />
             추가 요청 사항 (최우선 반영)
           </label>
           <p className="text-[10px] text-gray-500 mb-2 px-1">
             * {isProfileMode ? '프로필 사진 구도 내에서 세부 디테일을 조정할 때 사용하세요.' : '이곳에 적힌 내용은 위의 포즈/앵글 설정보다 우선 적용됩니다.'}
           </p>
           <textarea
            value={settings.additionalPrompt}
            onChange={(e) => onUpdate({...settings, additionalPrompt: e.target.value})}
            placeholder="예: 모든 컷에서 모델이 눈물을 흘리고 있어야 함. 흑백 사진 분위기. (위의 앵글/포즈 설정 무시하고 이것을 따름)"
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-3 min-h-[80px]"
          />
        </div>

      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10">
        <Button 
          fullWidth 
          size="lg" 
          onClick={onGenerate} 
          isLoading={isGenerating}
          disabled={!canGenerateReference}
          className={mode === 'reference' ? "shadow-purple-900/20 bg-gradient-to-r from-purple-500 to-rose-600" : "shadow-rose-900/20"}
        >
          <Sparkles className="w-5 h-5" />
          {mode === 'reference' ? '레퍼런스 믹스 생성' : '화보 생성하기'}
        </Button>
        {mode === 'reference' && !canGenerateReference && (
          <p className="text-center text-xs text-red-400 mt-2">
            모델 이미지는 필수이며, 의상은 사진 또는 텍스트 설명이 필요합니다.
          </p>
        )}
      </div>
    </div>
  );
};