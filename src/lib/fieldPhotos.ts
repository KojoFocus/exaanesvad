export const FIELD_PHOTOS = [
  '/hero/A1.2_Photo_Nima_2026-02-28_01.jpeg',
  '/hero/A1.2_Photo_Nima_2026-02-28_02.jpeg',
  '/hero/A1.2_Photo_Nima_2026-02-28_03.jpeg',
];

export function fieldPhoto(index: number): string {
  return FIELD_PHOTOS[index % FIELD_PHOTOS.length];
}
