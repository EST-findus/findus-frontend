# 목업 얼굴 이미지

내장 ImageGen으로 생성한 가상 한국인 6명의 사진입니다. 실제 실종아동이나 실제 연령 예측 결과가 아닙니다.
각 인물의 4칸 비교 이미지를 생성한 뒤 각 칸을 JPEG로 분리했습니다. 모든 사진은 543 × 724px입니다.
`lib/data.ts`의 `past`, `aged`, `styles`가 같은 관리번호 폴더를 참조합니다.

## 생성 프롬프트 세트

공통 지시: photorealistic-natural portrait sprite sheet; exactly four equal vertical 3:4 panels in one horizontal row, landscape 3:1 canvas. Fictional ordinary Korean person, frontal head-and-shoulders portraits, full hair visible with headroom, warm-gray background, diffuse natural light, natural skin texture. No text, labels, watermark, borders or extra faces. Panel 1 is the child; panel 2 is a plausible adult progression preserving eye spacing, nose, mouth and identifying features. Panels 3 and 4 keep the adult face, age, pose, expression, clothes, background and lighting unchanged and alter only the specified style.

| 인물 폴더 | 어린 시절 → 성인 | 스타일 1 | 스타일 2 |
| --- | --- | --- | --- |
| MC-2001-0812 | Korean boy age 5, round face, dark straight hair, small mole near upper left ear, yellow t-shirt and blue overall straps → same man age 30, short black hair, clean-shaven, ivory shirt | Thin dark round eyeglasses | Neat side-part, longer top |
| MC-1999-0341 | Korean girl age 7, long straight black hair, no double eyelid, slender chin, faint scar below right eye, cream shirt → same woman age 34, shoulder-length black hair, ivory blouse | Loose shoulder-length waves | Low ponytail |
| MC-2015-0104 | Korean boy age 9, narrow oval face, almond eyes, slightly prominent ears, dark t-shirt → same young man age 20, slim oval face, black hair, clean-shaven, ivory shirt | Tidy short haircut | Light moustache and chin stubble |
| MC-1994-0627 | Korean boy age 4, curly dark hair, dimples, slightly wide nose, red t-shirt → same man age 36, curly short hair, clean-shaven, ivory shirt | Longer wavy side-part | Trimmed short beard and moustache |
| MC-2008-0915 | Korean girl age 3, curly dark brown hair, yellow clip, round cheeks, almond eyes, white dress → same young woman age 21, long wavy dark brown hair, rounded nose, ivory blouse | Pronounced loose long waves | Chin-length bob |
| MC-2004-0302 | Korean baby girl age 1, large dark eyes, wispy light brown hair, small mole behind right ear, pale blue shirt → same young woman age 23, large dark eyes, shoulder-length dark brown hair, ivory blouse | Long straight hair | Half-up hairstyle |
