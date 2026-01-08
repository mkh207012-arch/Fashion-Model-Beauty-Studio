import { AspectRatio, LensConfig, ImageResolution, GridCount, GridSizing } from "./types";

export const LENSES: LensConfig[] = [
  {
    id: "rf85",
    name: "Canon RF 85mm f/1.2L USM",
    focalLength: "85mm",
    aperture: "f/1.2",
    description: "궁극의 인물 렌즈. 크리미한 배경 흐림(보케), 눈동자의 놀라운 선명도, 인물을 돋보이게 하는 압축 효과."
  },
  {
    id: "rf50",
    name: "Canon RF 50mm f/1.2L USM",
    focalLength: "50mm",
    aperture: "f/1.2",
    description: "마법 같은 입체감의 표준 화각. 반신(Half-body) 촬영에 적합하며 자연스러운 시선을 제공합니다."
  },
  {
    id: "rf35",
    name: "Canon RF 35mm f/1.4L VCM",
    focalLength: "35mm",
    aperture: "f/1.4",
    description: "광각 환경 인물 사진. 배경과 의상이 돋보이는 역동적인 구도를 연출합니다."
  },
  {
    id: "rf135",
    name: "Canon RF 135mm f/1.8L IS USM",
    focalLength: "135mm",
    aperture: "f/1.8",
    description: "강력한 망원 압축 효과. 배경과 피사체를 완벽하게 분리하여 몽환적인 분위기를 만듭니다."
  }
];

export const ASPECT_RATIOS = [
  { value: AspectRatio.Portrait, label: "세로 (3:4)" },
  { value: AspectRatio.Tall, label: "소셜 스토리 (9:16)" },
  { value: AspectRatio.Square, label: "정방형 (1:1)" },
  { value: AspectRatio.Landscape, label: "가로 (4:3)" },
  { value: AspectRatio.Wide, label: "시네마틱 (16:9)" },
];

export const RESOLUTIONS: { value: ImageResolution; label: string }[] = [
  { value: "1K", label: "표준 (1K)" },
  { value: "2K", label: "고화질 (2K)" },
  { value: "4K", label: "초고화질 (4K)" },
];

export const GRID_OPTIONS: { value: GridCount; label: string }[] = [
  { value: 1, label: "1장 (단독)" },
  { value: 2, label: "2장 분할" },
  { value: 3, label: "3장 분할" },
  { value: 4, label: "4장 분할" },
  { value: 6, label: "6장 분할" },
  { value: 9, label: "9장 분할" },
];

export const GRID_SIZING_OPTIONS: { value: GridSizing; label: string }[] = [
  { value: 'uniform', label: "동일 크기 (Uniform)" },
  { value: 'random', label: "랜덤 크기 (Random)" },
];

export const CAMERA_ANGLES = [
  "랜덤 (AI 추천)",
  "아이 레벨 (Standard Eye-Level) - 가장 자연스러운 시선",
  "로우 앵글 (Low Angle) - 다리가 길어 보이고 웅장함",
  "하이 앵글 (High Angle) - 얼굴이 돋보이고 귀여운 느낌",
  "더치 앵글 (Dutch Angle) - 역동적이고 힙한 분위기",
  "클로즈업 (Extreme Close-up) - 얼굴 디테일 강조",
  "바스트 샷 (Bust Shot) - 상반신 중심 포트레이트",
  "니 샷 (Knee Shot) - 무릎 위, 패션과 비율 강조",
  "풀 샷 (Full Shot) - 전신과 배경의 조화",
  "오버헤드 (Overhead) - 머리 위에서 내려다보는 구도"
];

export const FASHION_POSES = [
  "랜덤 (AI 추천)",
  "정면 응시 (Front View)",
  "측면 응시 (Side Profile)",
  "뒤돌아보기 (Looking Back)",
  "전신 워킹 (Walking Full Body)",
  "의자에 앉기 (Sitting on Chair)",
  "바닥에 앉기 (Sitting on Floor)",
  "다리 꼬기 (Crossed Legs)",
  "손으로 턱 받치기 (Hand on Chin)",
  "머리카락 쓸어넘기기 (Hand in Hair)",
  "얼굴 클로즈업 (Face Close-up)",
  "눈 감고 느끼기 (Eyes Closed)",
  "역동적인 점프 (Dynamic Jump)",
  "주머니에 손 넣기 (Hands in Pocket)",
  "팔짱 끼기 (Arms Crossed)",
  "소품 활용 (Holding Prop)"
];

export const CONCEPT_GROUPS = {
  indoor: {
    label: "실내 (Indoor)",
    items: [
      "깔끔한 스튜디오 (Studio Clean)",
      "럭셔리 호텔 (Luxury Hotel)",
      "감성 카페 (Cozy Cafe)",
      "모던 거실 (Modern Living Room)",
      "화려한 파티룸 (Fancy Party Room)",
      "클래식 도서관 (Classic Library)",
      "햇살 드는 창가 (Sunlit Window)"
    ]
  },
  outdoor: {
    label: "실외 (Outdoor)",
    items: [
      "네온 시티 야경 (Neon City Night)",
      "햇살 가득한 정원 (Sunlit Garden)",
      "푸른 해변 (Blue Beach)",
      "벚꽃 흩날리는 거리 (Cherry Blossom Street)",
      "도심 루프탑 (City Rooftop)",
      "숲속의 오솔길 (Forest Path)",
      "고급 리조트 수영장 (Luxury Resort Pool)"
    ]
  }
};

// --- Model Attributes ---

export const MODEL_ATTRIBUTES = {
  gender: ["여성 (Female)", "남성 (Male)"],
  nationality: ["한국인 (Korean)", "일본인 (Japanese)", "중국인 (Chinese)", "미국인 (American - Caucasian)", "유럽인 (European)", "혼혈 (Mixed Heritage)"],
  age: [
    "10대 초반 (Early Teens)",
    "10대 중반 (Mid Teens)",
    "10대 후반 (Late Teens)",
    "20대 초반 (Early 20s)",
    "20대 중반 (Mid 20s)",
    "20대 후반 (Late 20s)",
    "30대 (30s)",
    "40대 (40s / Middle-aged)",
    "50대 (50s / Mature)",
    "60대 이상 (60s+ / Senior / Silver Model)"
  ],
  height: [
    "150cm 대 (Short/Cute)",
    "160cm 초반 (Petite)",
    "165cm 평균 (Average)",
    "170cm 이상 (Tall Model)",
    "175cm 이상 (Runway Height)"
  ],
  bodyType: [
    "슬림형 (Slender) - 기본 슬림",
    "일반형 (Average) - 자연스러운 핏",
    "플러스 사이즈 (Plus-size / Curvy) - 볼륨감 있고 부드러운 곡선",
    "아담한 체형 (Petite Frame) - 작고 여리여리한 골격",
    "스키니/하이패션 (High-Fashion Skinny) - 모델처럼 매우 마르고 골격 강조",
    "하체 발달형 (Pear-shaped) - 상체는 슬림, 골반과 힙 발달",
    "글래머러스 (Glamorous / Hourglass) - 가슴과 힙이 강조된 모래시계형",
    "탄탄한 근육형 (Athletic / Fit) - 건강미 넘치는 근육질"
  ],
  proportion: [
    "선택 안 함 (Default)",
    "다리가 긴 타입 (Long Legs / Short Torso)",
    "허리가 긴 타입 (Long Torso / Short Legs)",
    "황금 비율 (Balanced 8-Head Ratio)"
  ],
  shoulderWidth: [
    "선택 안 함 (Default)",
    "좁은 어깨 (Narrow / Sloping) - 여리여리함 강조",
    "직각 어깨 (Square / Broad) - 옷걸이가 좋은 모델 체형",
    "라운드 숄더 (Rounded) - 부드러운 인상"
  ],
  makeup: [
    { 
      value: "K-Pop 아이돌 (Idol Stage Makeup)", 
      label: "K-Pop 아이돌 (Idol Stage Makeup)", 
      description: "글리터와 속눈썹을 강조하여 무대에서 빛나는 화려한 스타일입니다." 
    },
    { 
      value: "내추럴 투명 메이크업 (Natural No-Makeup Look)", 
      label: "내추럴 투명 메이크업 (Natural No-Makeup Look)", 
      description: "피부 결을 살리고 색조를 최소화한 청순하고 깨끗한 스타일입니다." 
    },
    { 
      value: "시크 스모키 (Chic Smoky)", 
      label: "시크 스모키 (Chic Smoky)", 
      description: "눈매를 깊고 진하게 강조하여 강렬하고 도시적인 분위기를 연출합니다." 
    },
    { 
      value: "과즙 메이크업 (Fruity/Juicy)", 
      label: "과즙 메이크업 (Fruity/Juicy)", 
      description: "볼터치와 립에 생기를 주어 상큼하고 발랄한 이미지를 줍니다." 
    },
    { 
      value: "배우 프로필 스타일 (Clean Actor Profile)", 
      label: "배우 프로필 스타일 (Clean Actor Profile)", 
      description: "이목구비의 장점을 자연스럽게 살린 단정하고 고급스러운 느낌입니다." 
    },
    { 
      value: "하이패션 런웨이 (Avant-garde High Fashion)", 
      label: "하이패션 런웨이 (Avant-garde High Fashion)", 
      description: "예술적이고 실험적인 터치로 개성을 극대화한 모던한 스타일입니다." 
    }
  ]
};

export const ANIMAL_FACE_SHAPES = [
  {
    category: "1. 순수하고 귀여운 계열 (Lovely & Cute)",
    items: [
      { 
        id: "puppy", 
        label: "강아지상 (Puppy)", 
        descriptionKo: "눈꼬리가 살짝 처지고 눈동자가 커서 순하고 친근한 인상을 줍니다. (예: 박보영, 백현)",
        prompt: "drooping eye corners, large round pupils, soft jawline, round nose tip. Warm, friendly, approachable, puppy-like eyes." 
      },
      { 
        id: "rabbit", 
        label: "토끼상 (Rabbit)", 
        descriptionKo: "앞니가 살짝 보이고 인중이 짧으며 볼이 발그레한 귀엽고 사랑스러운 동안입니다. (예: 나연, 정국)",
        prompt: "large front teeth, short philtrum, bright round eyes, rosy cheeks. Adorable, youthful, lively, bunny-like." 
      },
      { 
        id: "hamster", 
        label: "햄스터상 (Hamster)", 
        descriptionKo: "볼이 통통하고 이목구비가 작고 오밀조밀하여 주머니에 넣고 싶은 귀여움이 특징입니다.",
        prompt: "puffy cheeks, small button nose, tiny mouth, round face. Squeezable, tiny, innocent, soft-focus." 
      },
      { 
        id: "quokka", 
        label: "쿼카상 (Quokka)", 
        descriptionKo: "입꼬리가 항상 올라가 있고 하관이 짧아 언제나 행복하게 웃는 듯한 인상입니다.",
        prompt: "upturned corners of the mouth, chubby lower face, sparkling eyes. Joyful, happiest animal, blunt chin, wide smile." 
      }
    ]
  },
  {
    category: "2. 시크하고 매혹적인 계열 (Chic & Charismatic)",
    items: [
      { 
        id: "cat", 
        label: "고양이상 (Cat)", 
        descriptionKo: "눈꼬리가 올라가고 콧대가 높으며 턱선이 날렵하여 도도하고 세련된 분위기를 풍깁니다. (예: 해린, 제니)",
        prompt: "upturned eyes, sharp inner corners of eyes, high bridge nose, V-shaped chin. Sharp, sophisticated, mysterious, feline-like." 
      },
      { 
        id: "fox", 
        label: "여우상 (Fox)", 
        descriptionKo: "눈이 가로로 길고 눈매가 그윽하며, 지적이고 매혹적인 느낌을 주는 얼굴입니다. (예: 황민현, 예지)",
        prompt: "elongated eyes, slanted almond eyes, pointed chin, sharp facial contours. Seductive, clever, elegant, mature, foxy." 
      },
      { 
        id: "snake", 
        label: "뱀상 (Snake)", 
        descriptionKo: "눈매가 날카롭고 피부가 하얗며, 차갑지만 치명적인 카리스마가 느껴지는 인상입니다. (예: 카리나)",
        prompt: "narrow sharp eyes, thin lips, pale skin, flawless sharp T-zone. Cold, charismatic, AI-like perfection, lethal." 
      },
      { 
        id: "wolf", 
        label: "늑대상 (Wolf)", 
        descriptionKo: "T존이 뚜렷하고 눈빛이 강렬하며, 야생적이고 남성미/걸크러쉬가 돋보입니다.",
        prompt: "fierce gaze, strong brow bone, defined jawline, cool-toned skin. Tomboyish, wild, intense, charismatic, wolf-like." 
      }
    ]
  },
  {
    category: "3. 우아하고 맑은 계열 (Elegant & Pure)",
    items: [
      { 
        id: "deer", 
        label: "사슴상 (Deer)", 
        descriptionKo: "눈망울이 크고 맑으며 목이 길고 얼굴형이 갸름하여 우아하고 청초한 분위기입니다. (예: 윤아)",
        prompt: "large doe eyes, long slender neck, clean oval face, long eyelashes. Graceful, pure, clear, serene, deer-like." 
      },
      { 
        id: "bird", 
        label: "새상/요정상 (Bird/Fairy)", 
        descriptionKo: "얼굴이 매우 작고 이목구비가 섬세하여 현실감이 없는 요정 같은 신비로운 느낌입니다.",
        prompt: "small face, dainty features, pointed small lips, delicate bone structure. Ethereal, fairy-like, fragile, petite." 
      }
    ]
  },
  {
    category: "4. 개성 있고 싱그러운 계열 (Unique & Fresh)",
    items: [
      { 
        id: "turtle", 
        label: "꼬부기상 (Turtle)", 
        descriptionKo: "입이 크고 시원하며 웃을 때 반달눈이 되어 보는 사람을 기분 좋게 만드는 활기찬 인상입니다.",
        prompt: "wide mouth, curved lip line, large eyes, round face. Refreshing, cheerful, bright, energetic." 
      },
      { 
        id: "frog", 
        label: "개구리상 (Frog)", 
        descriptionKo: "눈이 크고 돌출형이며 입체적인 얼굴로, 하이패션과 독특한 컨셉을 잘 소화합니다.",
        prompt: "wide-set eyes, prominent eyes, wide smile, unique facial structure. High-fashion, artistic, distinctive, fresh." 
      }
    ]
  }
];
