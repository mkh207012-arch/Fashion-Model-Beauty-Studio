import { GoogleGenAI } from "@google/genai";
import { GenerationSettings, LensConfig, ReferenceImage } from "../types";
import { LENSES, ANIMAL_FACE_SHAPES, FACIAL_MOODS } from "../constants";

const MODEL_NAME = "gemini-3-pro-image-preview";
const LOCAL_STORAGE_KEY = "k_beauty_studio_api_key_v1";

// --- API Key Management ---

/**
 * Retrieves the API key from Local Storage (decrypted).
 * Safe for browser environments.
 */
export const getApiKey = (): string | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return atob(stored); // Simple Base64 decode
    }
  } catch (e) {
    console.error("Failed to retrieve API key", e);
  }
  
  // Note: We removed process.env check entirely to prevent runtime crashes in browser environments.
  // Users must enter their key via the UI.
  return null;
};

/**
 * Encrypts (Obfuscates) and saves the API key to Local Storage.
 */
export const saveApiKey = (key: string) => {
  if (!key) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return;
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, btoa(key)); // Simple Base64 encode
};

/**
 * Validates the API Key by making a lightweight call.
 */
export const validateConnection = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Use a standard lightweight text model for validation (Fixed from non-existent 2.5 version)
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
    });
    return true;
  } catch (error) {
    console.error("Connection validation failed:", error);
    return false;
  }
};

/**
 * Ensures a valid API key is available.
 */
function getClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 우측 상단 설정 버튼을 눌러 API Key를 등록해주세요.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Helper to parse Data URL to extract MimeType and Base64 Data
 */
function parseDataUrl(dataUrl: string): { mimeType: string, data: string } {
  try {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length >= 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
    
    // Fallback for less standard data URLs
    const splitComma = dataUrl.split(',');
    if (splitComma.length === 2) {
      const mimeMatch = splitComma[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      return { mimeType, data: splitComma[1] };
    }
  } catch (e) {
    console.warn("Failed to parse data URL strictly, attempting fallback", e);
  }
  throw new Error("Invalid image data format. Please try uploading the image again.");
}

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

function getFaceShapePrompt(faceShapeId: string): string {
  for (const group of ANIMAL_FACE_SHAPES) {
    const found = group.items.find(item => item.id === faceShapeId);
    if (found) {
      return `Face Type: ${found.label} style. Visual traits: ${found.prompt}`;
    }
  }
  return "";
}

function getFacialMoodPrompt(moodId: string): string {
  const mood = FACIAL_MOODS.find(m => m.value === moodId);
  return mood ? mood.prompt : "";
}

/**
 * Generates a sophisticated body description based on interactions between height, body type, proportion, and shoulders.
 */
function getBodySynergyPrompt(height: string, bodyType: string, proportion: string, shoulderWidth: string): string {
  let description = `Physique: ${height}, ${bodyType}.`;
  
  // 1. Analyze Height Category
  const isShort = height.includes("150cm") || height.includes("160cm 초반");
  const isTall = height.includes("170cm") || height.includes("175cm");
  
  // 2. Analyze Body Type Keywords
  const isSlim = bodyType.includes("슬림") || bodyType.includes("스키니");
  const isCurvy = bodyType.includes("플러스") || bodyType.includes("글래머러스");
  const isPetite = bodyType.includes("아담한");
  const isPear = bodyType.includes("하체 발달형");

  // 3. Synergy Logic (Interactions)
  
  // [Height + Body Type Synergy]
  if (isShort && isSlim) {
    description += " Visual Vibe: Dainty, fairy-like, delicate bone structure, cute and petite proportions.";
  } else if (isTall && isSlim) {
    description += " Visual Vibe: Statuesque, runway model physique, long limbs, willow-like elegance, high-fashion editorial look.";
  } else if (isShort && isCurvy) {
    description += " Visual Vibe: Compact curves, soft and romantic silhouette, adorable yet alluring.";
  } else if (isTall && isCurvy) {
    description += " Visual Vibe: Grand goddess-like presence, powerful curves, imposing and luxurious figure.";
  }
  
  // [Specific Body Type Keywords]
  if (isPetite) {
     description += " Features: Short torso, delicate joints, small frame.";
  }
  if (bodyType.includes("스키니")) {
     description += " Features: Bony structure, ultra-slim, chic and sharp lines.";
  }
  if (bodyType.includes("플러스")) {
     description += " Features: Curvy plus-size, soft silhouette, realistic body standards, voluminous beauty.";
  }
  if (bodyType.includes("글래머러스")) {
     // User request: No waist mention, no hourglass mention. Random waist. Just volume.
     description += " Features: Voluptuous physique. Prominent large bust and full hips. Emphasis on body volume. Realistic body shape.";
  }
  if (isPear) {
     description += " Features: Pear-shaped, wide hips, thicker thighs, narrow shoulders, feminine lower body curve.";
  }

  // 4. Detailed Settings (Proportion & Shoulders)
  if (proportion && !proportion.includes("선택 안 함")) {
     description += ` Proportion Emphasis: ${proportion}.`;
  }
  
  if (shoulderWidth && !shoulderWidth.includes("선택 안 함")) {
     description += ` Shoulder Structure: ${shoulderWidth}.`;
  }

  return description;
}

function getBaseStylePrompt(lens: LensConfig, settings?: GenerationSettings): string {
  let subjectDescription = "Professional female fashion model.";
  let faceDetails = "Charming and attractive face.";

  if (settings && settings.model) {
    const { gender, nationality, age, height, bodyType, proportion, shoulderWidth, faceShape, facialMood } = settings.model;
    const facePrompt = getFaceShapePrompt(faceShape);
    const bodyPrompt = getBodySynergyPrompt(height, bodyType, proportion, shoulderWidth);
    const moodPrompt = getFacialMoodPrompt(facialMood);

    subjectDescription = `
      Professional Fashion Model.
      Demographics: ${nationality}, ${gender}, ${age}.
      ${bodyPrompt}
    `;
    
    faceDetails = `
      Detailed Facial Features:
      ${facePrompt}
      ${moodPrompt ? `Facial Mood & Vibe: ${moodPrompt}` : ""}
      Styling Guidance: Create makeup and styling that perfectly compliments the ${faceShape} face type and ${facialMood} mood.
      High quality, detailed skin texture, expressive eyes.
    `;
  }

  return `
    High-end commercial fashion photography.
    Luxury fashion magazine editorial style.
    K-POP idol aesthetic, sophisticated and trendy.
    Flawless skin texture, vivid colors, professional studio lighting.
    Bright and lively atmosphere, photo-realistic 8K resolution.
    Ultra-detailed, sharp focus on eyes and face.
    Crystal clear quality, clean composition.
    
    Subject details:
    ${subjectDescription}
    Elegant and confident pose.
    ${faceDetails}

    Camera: Canon EOS R5.
    Lens: ${lens.name} (${lens.focalLength}, ${lens.aperture}).
    Technique: ${lens.description}.
  `;
}

function getGridPrompt(settings: GenerationSettings): string {
  if (settings.layoutMode === 'profile_spread') {
     return `
      FORMAT: Character Reference Sheet / Model Profile Card (Comp Card).
      Canvas Ratio: 16:9.
      LAYOUT: Three distinct sections arranged horizontally (Left, Center, Right).
      
      COMPOSITION:
      1. LEFT SECTION: Extreme Close-up of the face (Beauty Shot). Focus on makeup, skin texture, and eye expression.
      2. CENTER SECTION: Full Body Frontal View. Standing confident pose. Show the full outfit clearly from head to toe.
      3. RIGHT SECTION: Full Body Back View. Standing pose showing the back of the outfit/hair.
      
      CRITICAL CONSTRAINT 1: The character MUST be identical in all three shots (same face, same hair, same outfit, same body type).
      CRITICAL CONSTRAINT 2: ABSOLUTELY NO TEXT, NO LABELS, NO WATERMARKS, NO TYPOGRAPHY ON THE IMAGE. PURE PHOTOGRAPHY ONLY.
      Background: Consistent studio background across all three sections.
     `;
  }

  if (settings.gridCount === 1) {
    const effectiveAngle = settings.customCameraAngles[0]?.trim() || settings.cameraAngles[0];
    const effectivePose = settings.customPoses[0]?.trim() || settings.poses[0];

    return `
      Composition: Single full-frame high-quality photo.
      Camera Angle: ${effectiveAngle}.
      Pose: ${effectivePose}.
    `;
  }

  const sizingDesc = settings.gridSizing === 'uniform' 
    ? "Split the image into equal-sized panels." 
    : "Create a collage with varied sized panels (artistic layout).";
  
  let panelsDesc = "";
  settings.poses.forEach((pose, idx) => {
    const angle = settings.customCameraAngles[idx]?.trim() || settings.cameraAngles[idx];
    const finalPose = settings.customPoses[idx]?.trim() || pose;
    panelsDesc += `Panel ${idx + 1}: Angle: ${angle}, Pose: ${finalPose}\n`;
  });

  return `
    FORMAT: PHOTO COLLAGE / SPLIT SCREEN.
    Count: ${settings.gridCount} distinct distinct sub-images (panels) merged into one final image file.
    Layout: ${sizingDesc}
    
    PANEL CONFIGURATIONS (Angle & Pose per cut):
    ${panelsDesc}
    
    Ensure borders between panels are clean (white or thin black line or gapless).
    Maintain consistent lighting and color grading across all panels.
  `;
}

function getPriorityInstructions(settings: GenerationSettings): string {
  if (!settings.additionalPrompt || settings.additionalPrompt.trim() === "") {
    return "";
  }
  return `
    *** GLOBAL OVERRIDE INSTRUCTIONS (HIGHEST PRIORITY) ***
    USER REQUEST: "${settings.additionalPrompt}"
    
    CRITICAL NOTE: 
    The "USER REQUEST" above takes ABSOLUTE PRECEDENCE over any specific camera angle, pose, or layout settings defined previously.
    If the user request contradicts the selected pose or angle, IGNORE the selection and FOLLOW the user request.
  `;
}

async function handleResponse(response: any): Promise<string> {
    // Check if candidates exist
    if (!response.candidates || response.candidates.length === 0) {
        if (response.promptFeedback?.blockReason) {
            const reason = response.promptFeedback.blockReason;
            if (reason === 'OTHER') {
                 throw new Error("Generation blocked (Reason: OTHER). The system may have interpreted the prompt or reference image as sensitive. Please try a different pose or reference image.");
            }
            throw new Error(`Generation blocked: ${reason}. The prompt may have violated safety policies.`);
        }
        throw new Error("The model returned no results. This might be due to high safety settings or a refusal to generate the specific content.");
    }

    const candidate = response.candidates[0];
    
    // Check finish reason
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        if (candidate.finishReason === 'SAFETY') {
             throw new Error("Generation blocked by safety filters. Please try modifying the prompt or using a different reference image.");
        }
        if (candidate.finishReason === 'RECITATION') {
             throw new Error("Generation blocked due to recitation check.");
        }
        if (candidate.finishReason === 'OTHER') {
             throw new Error("Generation blocked (Reason: OTHER). This typically occurs when the model detects potential policy violations in the reference images. Please try a different reference image.");
        }
    }

    let textResponse = "";
    // Iterate through parts to find the image
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textResponse += part.text;
      }
    }
    
    if (textResponse) {
        // If the model returned text but no image, it's usually a refusal explanation.
        throw new Error(`Model Refusal: ${textResponse}`);
    }

    throw new Error(`No image data received from model. Finish Reason: ${candidate.finishReason || 'Unknown'}`);
}

export const generateImage = async (settings: GenerationSettings): Promise<string> => {
  const ai = getClient();
  const selectedLens = LENSES.find(l => l.id === settings.lensId) || LENSES[0];
  const prompt = buildPrompt(selectedLens, settings);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.resolution,
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const editImage = async (
  originalImageUrl: string, 
  editPrompt: string, 
  settings: GenerationSettings
): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(originalImageUrl);
  const selectedLens = LENSES.find(l => l.id === settings.lensId) || LENSES[0];
  const styleContext = getBaseStylePrompt(selectedLens, settings);
  const effectiveAngle = settings.customCameraAngles[0]?.trim() || settings.cameraAngles[0];
  
  const finalPrompt = `
    ${styleContext}
    
    ORIGINAL CONTEXT:
    Concept: ${settings.customLocation || settings.concept}
    Primary Camera Angle: ${effectiveAngle}
    
    USER EDIT REQUEST: 
    ${editPrompt}
    
    Maintain the original composition, lighting, and high-quality 8K aesthetic. 
    Only modify the specific details requested in the edit.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: finalPrompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.resolution,
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Image edit error:", error);
    throw error;
  }
};

export const generateConsistentImage = async (
  referenceImageUrl: string,
  newContextPrompt: string,
  settings: GenerationSettings
): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(referenceImageUrl);
  const selectedLens = LENSES.find(l => l.id === settings.lensId) || LENSES[0];
  const styleContext = getBaseStylePrompt(selectedLens, settings);
  const gridPrompt = getGridPrompt(settings);
  const priorityInstructions = getPriorityInstructions(settings);

  const finalPrompt = `
    ${styleContext}

    TASK:
    The provided image is the Reference Model.
    Generate a COMPLETELY NEW photo (or photo set) of this consistent character (face, hairstyle, physique).
    
    LAYOUT & COMPOSITION:
    ${gridPrompt}
    
    NEW SCENE / ACTION REQUIREMENTS:
    ${newContextPrompt}
    
    ${priorityInstructions}
    
    CRITICAL INSTRUCTIONS:
    1. Maintain consistent character identity (Face, Hair, Physique) with the reference image.
    2. Change the Pose, Angle, and Background according to the "New Scene" and "Layout" requirements.
    3. Maintain the "Commercial Beauty Pictorial" aesthetic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: finalPrompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.resolution,
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Consistent generation error:", error);
    throw error;
  }
};

export const generateFromReferences = async (
  modelRefs: ReferenceImage[],
  clothingRefs: ReferenceImage[],
  locationRefs: ReferenceImage[] = [], // Added location refs
  settings: GenerationSettings
): Promise<string> => {
  const ai = getClient();
  const selectedLens = LENSES.find(l => l.id === settings.lensId) || LENSES[0];
  // Even in reference mode, we pass settings so we can fallback to descriptions if needed
  const styleContext = getBaseStylePrompt(selectedLens, settings);
  const gridPrompt = getGridPrompt(settings);
  const priorityInstructions = getPriorityInstructions(settings);
  
  const parts: any[] = [];
  
  // 1. Add Model Images
  const selectedModelRefs = modelRefs.filter(r => r.selected);
  for (const ref of selectedModelRefs) {
    const { mimeType, data } = parseDataUrl(ref.url);
    parts.push({
      inlineData: { mimeType, data }
    });
  }

  // 2. Add Clothing Images
  const selectedClothingRefs = clothingRefs.filter(r => r.selected);
  for (const ref of selectedClothingRefs) {
    const { mimeType, data } = parseDataUrl(ref.url);
    parts.push({
      inlineData: { mimeType, data }
    });
  }

  // 3. Add Location Images
  const selectedLocationRefs = locationRefs.filter(r => r.selected);
  for (const ref of selectedLocationRefs) {
    const { mimeType, data } = parseDataUrl(ref.url);
    parts.push({
      inlineData: { mimeType, data }
    });
  }

  const effectiveConcept = settings.customLocation && settings.customLocation.trim().length > 0 
    ? settings.customLocation 
    : settings.concept;

  // -- Location Instruction --
  let locationInstruction = "";
  let locationInputDesc = "";

  if (selectedLocationRefs.length > 0) {
    locationInputDesc = `- The NEXT ${selectedLocationRefs.length} images are 'BACKGROUND REFERENCE' (Location/Scene).`;
    locationInstruction = `
    3. BACKGROUND/LOCATION REFERENCE:
       - Use the provided 'BACKGROUND REFERENCE' images as the setting.
       - Replicate the architectural style, lighting atmosphere, and environment details from these images.
       - Integrate the model naturally into this specific background.
    `;
  } else {
    locationInputDesc = `- No specific background reference images provided.`;
    locationInstruction = `
    3. BACKGROUND/LOCATION:
       - Generate the background based on the text concept: "${effectiveConcept}".
    `;
  }

  // -- Clothing Instruction --
  let clothingInstruction = "";
  let clothingInputDesc = "";

  if (selectedClothingRefs.length > 0) {
     clothingInputDesc = `- The NEXT ${selectedClothingRefs.length} images are the 'CLOTHING REFERENCE' (Target Outfit).`;
     clothingInstruction = `
     2. OUTFIT REPLACEMENT (VIRTUAL TRY-ON):
        - Disregard the clothing worn in the 'IDENTITY REFERENCE' images.
        - Dress the model in the items from the 'CLOTHING REFERENCE'.
        - Accurately replicate the fabric, color, texture, and silhouette of the reference clothing.
        - Ensure the clothing fits the model's body shape naturally.
        (Note: ${settings.clothingPrompt ? `Additional Styling Details: "${settings.clothingPrompt}"` : "Follow the clothing reference exactly."})
     `;
  } else {
     clothingInputDesc = `- No specific clothing reference images provided.`;
     clothingInstruction = `
     2. OUTFIT REPLACEMENT:
        - The user has provided a text description for the new outfit.
        - OUTFIT DESCRIPTION: "${settings.clothingPrompt}"
        - Generate a high-fashion outfit matching this description, replacing the original clothes.
     `;
  }

  // -- Model Instruction --
  let characterInstruction = "";
  let modelInputDesc = "";
  
  if (selectedModelRefs.length > 0) {
    modelInputDesc = `- Group A: First ${selectedModelRefs.length} images = Character Reference (Face, Hair, Body).`;
    characterInstruction = `1. CHARACTER: Generate a character that looks like the person in Group A. Maintain consistency in facial features, hairstyle, and body proportions.`;
  } else {
    modelInputDesc = `- No specific character reference images provided.`;
    // Use the Model Settings from Control Panel
    const { gender, nationality, age, height, bodyType, proportion, shoulderWidth, faceShape, facialMood } = settings.model;
    const facePrompt = getFaceShapePrompt(faceShape);
    // Use the synergy logic here too for consistent descriptions in reference mode
    const bodyPrompt = getBodySynergyPrompt(height, bodyType, proportion, shoulderWidth);
    const moodPrompt = getFacialMoodPrompt(facialMood);
    
    characterInstruction = `
    1. CHARACTER GENERATION:
       - Generate a professional fashion model based on these attributes:
       - ${nationality}, ${gender}, ${age}.
       - ${bodyPrompt}
       - Face: ${facePrompt}
       ${moodPrompt ? `- Vibe: ${moodPrompt}` : ""}
    `;
  }

  const promptText = `
    ${styleContext}

    TASK: Fashion Editorial with Consistent Character and Environment.

    INPUT REFERENCES:
    ${modelInputDesc}
    ${clothingInputDesc}
    ${locationInputDesc}

    INSTRUCTIONS:
    Generate a high-end commercial fashion photo.
    ${characterInstruction}
    ${clothingInstruction}
    ${locationInstruction}
    
    4. COMPOSITION: Seamlessly integrate the character, outfit, and background.

    SCENE & COMPOSITION:
    Concept/Location (Text Hint): ${effectiveConcept}
    ${gridPrompt}
    
    ${priorityInstructions}
    
    STYLE NOTES:
    - Photorealistic, 8K resolution.
    - Professional fashion lighting.
    - Natural skin texture.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: parts },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.resolution,
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Reference generation error:", error);
    throw error;
  }
};

export const extractOutfit = async (imageBase64: string): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(imageBase64);

  const prompt = `
    TASK: Analyze the clothing, shoes, and accessories worn by the model in this image.
    Generate a high-end commercial product photography shot of ONLY these items.
    
    STYLE: 
    - "Flat Lay" (items arranged neatly on a surface) OR "Ghost Mannequin" (invisible 3D form).
    - High-fashion magazine catalog style.
    - Professional studio lighting.
    - Clean, neutral background (Off-white or light grey).
    
    CONTENT:
    - Include the main outfit (Top, Bottom, Dress, Outerwear).
    - Include visible accessories (Shoes, Bag, Jewelry, Hats).
    - REMOVE the human body, face, hair, and skin.
    - Focus strictly on the fashion items as a product display.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "2K",
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Outfit extraction error:", error);
    throw error;
  }
};

export const editOutfit = async (imageBase64: string, editPrompt: string): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(imageBase64);

  const prompt = `
    TASK: Edit this fashion product image according to the user's request.
    USER REQUEST: "${editPrompt}"
    
    CONSTRAINTS:
    - Maintain the "Flat Lay" or "Product Photography" style.
    - Keep the background clean and neutral unless specified otherwise.
    - High-quality commercial finish.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "2K",
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Outfit edit error:", error);
    throw error;
  }
};

export const extractBackground = async (imageBase64: string): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(imageBase64);

  const prompt = `
    TASK: Remove the person/model from this image and generate a clean, empty background.
    
    INSTRUCTIONS:
    - Identify the background environment (architecture, landscape, furniture, lighting).
    - Remove ALL human subjects from the scene.
    - Fill in the empty space (Inpainting) where the person was, using context from the surroundings.
    - The result should look like a natural, empty room or location shot.
    - Preserve the original lighting, depth of field, and atmosphere.
    - Do NOT crop the image. Maintain the original composition.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", // Attempt to keep wide, though model might adjust
          imageSize: "2K",
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Background extraction error:", error);
    throw error;
  }
};

export const editBackground = async (imageBase64: string, editPrompt: string): Promise<string> => {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(imageBase64);

  const prompt = `
    TASK: Edit this background image according to the user's request.
    USER REQUEST: "${editPrompt}"
    
    CONSTRAINTS:
    - Keep the image as a background scene (no people).
    - Maintain high-quality architectural/landscape details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K",
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    return await handleResponse(response);
  } catch (error: any) {
    console.error("Background edit error:", error);
    throw error;
  }
};

function buildPrompt(lens: LensConfig, settings: GenerationSettings): string {
  const baseDescription = getBaseStylePrompt(lens, settings); // Pass settings here to get model info
  const gridPrompt = getGridPrompt(settings);
  const priorityInstructions = getPriorityInstructions(settings);

  const effectiveConcept = settings.customLocation && settings.customLocation.trim().length > 0 
    ? settings.customLocation 
    : settings.concept;

  const context = `
    Concept/Location: ${effectiveConcept}.
    ${gridPrompt}
    
    ${priorityInstructions}
  `;

  return `${baseDescription}\n${context}`;
}