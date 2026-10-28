// Figma 스프라이트 크롭 값 모음 (node 10:6324, 10:6453, 10:6777)
import categorySprite from './assets/category-sprite.webp'
import infoSprite from './assets/info-sprite.webp'
import summarySprite from './assets/summary-sprite.webp'
import sendCourseCar from '@/assets/images/send-course-car.webp'
import type { SpriteCrop } from './components/SpriteImage'
import type { CategoryId } from './types'

export { categorySprite, infoSprite, summarySprite, sendCourseCar }

const crop = (
  width: number,
  height: number,
  imgWidth: number,
  imgHeight: number,
  left: number,
  top: number,
): SpriteCrop => ({
  width,
  height,
  imgWidth: `${imgWidth}%`,
  imgHeight: `${imgHeight}%`,
  left: `${left}%`,
  top: `${top}%`,
})

/** 카테고리 칩 이모지 */
export const CATEGORY_ICONS: Record<CategoryId, SpriteCrop> = {
  sea: crop(21, 18, 633.24, 251.39, -16.91, -90.63),
  night: crop(19, 19, 721.59, 229.84, -164.78, -72.38),
  cafe: crop(20, 21, 674.53, 214.84, -280.75, -63.8),
  nature: crop(25, 17, 541.65, 255.83, -326.43, -91.87),
  camp: crop(27, 19, 570.08, 270.15, -458.53, -102.61),
}

/** 드라이브 정보 배너 칩 아이콘 */
export const INFO_ICONS = {
  weather: crop(33, 27, 436.14, 176.16, -30.92, -37.23),
  traffic: crop(30, 22, 479.47, 224.15, -190.07, -71.83),
  theme: crop(26, 21, 408.27, 163.43, -294.36, -32.05),
}

/** 장소 상세 드라이브 정보 요약 아이콘 */
export const SUMMARY_ICONS = {
  duration: crop(21, 21, 731.71, 243.9, -60.98, -75.61),
  route: crop(22, 18, 697.67, 277.78, -227.91, -100),
  parking: crop(18, 19, 833.33, 263.16, -472.22, -89.47),
  visitTime: crop(21, 21, 731.71, 243.9, -575.61, -75.61),
}

/** 연인에게 보내기 팝업 자동차 일러스트 */
export const SEND_CAR_CROP = crop(124, 143, 190.79, 153.31, -45.18, -25.19)
