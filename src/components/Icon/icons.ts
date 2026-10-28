// Figma 에서 export 한 SVG 아이콘 레지스트리. 원본 크기/색을 그대로 사용한다.
import back from '@/assets/icons/back.svg'
import share from '@/assets/icons/share.svg'
import close from '@/assets/icons/close.svg'
import heart from '@/assets/icons/heart.svg'
import heartFilled from '@/assets/icons/heart-filled.svg'
import heartCard from '@/assets/icons/heart-card.svg'
import heartFilledCard from '@/assets/icons/heart-filled-card.svg'
import search from '@/assets/icons/search.svg'
import calendar from '@/assets/icons/calendar.svg'
import pin from '@/assets/icons/pin.svg'
import car from '@/assets/icons/car.svg'
import carButton from '@/assets/icons/car-button.svg'
import carButtonPressed from '@/assets/icons/car-button-pressed.svg'
import sendHeart from '@/assets/icons/send-heart.svg'
import sendHeartPressed from '@/assets/icons/send-heart-pressed.svg'
import navHome from '@/assets/icons/nav-home.svg'
import navHomeFilled from '@/assets/icons/nav-home-filled.svg'
import navMap from '@/assets/icons/nav-map.svg'
import navMapFilled from '@/assets/icons/nav-map-filled.svg'
import navStudio from '@/assets/icons/nav-studio.svg'
import navStudioFilled from '@/assets/icons/nav-studio-filled.svg'
import navMy from '@/assets/icons/nav-my.svg'
import navMyFilled from '@/assets/icons/nav-my-filled.svg'
import navFab from '@/assets/icons/nav-fab.svg'
import navFabActive from '@/assets/icons/nav-fab-active.svg'

export const icons = {
  back,
  share,
  close,
  heart,
  'heart-filled': heartFilled,
  'heart-card': heartCard,
  'heart-filled-card': heartFilledCard,
  search,
  calendar,
  pin,
  car,
  'car-button': carButton,
  'car-button-pressed': carButtonPressed,
  'send-heart': sendHeart,
  'send-heart-pressed': sendHeartPressed,
  'nav-home': navHome,
  'nav-home-filled': navHomeFilled,
  'nav-map': navMap,
  'nav-map-filled': navMapFilled,
  'nav-studio': navStudio,
  'nav-studio-filled': navStudioFilled,
  'nav-my': navMy,
  'nav-my-filled': navMyFilled,
  'nav-fab': navFab,
  'nav-fab-active': navFabActive,
} as const

export type IconName = keyof typeof icons
