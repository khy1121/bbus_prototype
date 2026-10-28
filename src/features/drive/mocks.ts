// 백엔드 연동 전 목업 데이터. 사진/앨범 이미지는 API 로 내려올 자리.
import a1 from './assets/albums/a1.webp'
import a2 from './assets/albums/a2.webp'
import a3 from './assets/albums/a3.webp'
import a4 from './assets/albums/a4.webp'
import a5 from './assets/albums/a5.webp'
import a6 from './assets/albums/a6.webp'
import a7 from './assets/albums/a7.webp'
import m1 from './assets/menus/m1.webp'
import m2 from './assets/menus/m2.webp'
import m3 from './assets/menus/m3.webp'
import m4 from './assets/menus/m4.webp'
import oido from './assets/places/oido.webp'
import bukhan from './assets/places/bukhan.webp'
import mongsanpo from './assets/places/mongsanpo.webp'
import type { PlaceSummary } from '@/components'
import type {
  BalanceQuestion,
  MemoryQuestion,
  Place,
  QuizQuestion,
  RadioStory,
  RecentSearch,
  RestStop,
  Track,
} from './types'

export const MY_POSITION = { lat: 37.4837, lng: 127.0324 } // 서초구 서초동
export const MY_ADDRESS = '서초구 서초동'

export const MOCK_PLACES: Place[] = [
  { id: 'banpo', name: '서울 반포 한강공원', address: '서울 서초구 신반포로11길 40', distanceKm: 3.2, position: { lat: 37.5104, lng: 126.9959 } },
  { id: 'ichon', name: '서울 이촌 한강공원', address: '서울 용산구 이촌로72길 62', distanceKm: 5.1, position: { lat: 37.5172, lng: 126.9707 } },
  { id: 'ttukseom', name: '서울 뚝섬 한강공원', address: '서울 광진구 강변북로 139', distanceKm: 7.8, position: { lat: 37.5292, lng: 127.0699 } },
  { id: 'jamsil', name: '서울 잠실 한강공원', address: '서울 송파구 한가람로 65', distanceKm: 8.1, position: { lat: 37.5175, lng: 127.0828 } },
  { id: 'yeouido', name: '서울 여의도 한강공원', address: '서울 영등포구 여의동로 330', distanceKm: 9.4, position: { lat: 37.5284, lng: 126.9346 } },
  { id: 'gwangnaru', name: '서울 광나루 한강공원', address: '서울 강동구 선사로 83-66', distanceKm: 13.1, position: { lat: 37.5465, lng: 127.1196 } },
  { id: 'oido', name: '시흥 오이도', address: '경기 시흥시 오이도로 175', distanceKm: 38.4, position: { lat: 37.3459, lng: 126.6879 } },
  { id: 'bukhan', name: '남양주 북한강 카페거리', address: '경기 남양주시 조안면 북한강로', distanceKm: 32.6, position: { lat: 37.5765, lng: 127.3157 } },
  { id: 'heonhwa', name: '강릉 헌화로', address: '강원 강릉시 강동면 헌화로', distanceKm: 221.3, position: { lat: 37.7095, lng: 129.0039 } },
  { id: 'sanjeong', name: '포천 산정호수', address: '경기 포천시 영북면 산정호수로 411', distanceKm: 74.2, position: { lat: 38.0706, lng: 127.3165 } },
  { id: 'mongsanpo', name: '태안 몽산포 캠핑장', address: '충남 태안군 남면 몽산포길 65-27', distanceKm: 172.5, position: { lat: 36.6719, lng: 126.2808 } },
]

export const MOCK_RECENT_SEARCHES: RecentSearch[] = [
  { id: 'r1', keyword: '서울 반포 한강공원', date: '10.25' },
  { id: 'r2', keyword: '남양주 북한강 카페거리', date: '10.23' },
  { id: 'r3', keyword: '강릉 헌화로', date: '10.23' },
  { id: 'r4', keyword: '포천 산정호수', date: '10.22' },
  { id: 'r5', keyword: '시흥 오이도', date: '10.20' },
]

export const MOCK_POPULAR_ROUTES: PlaceSummary[] = [
  { id: 'oido', name: '시흥 오이도', region: '경기 시흥시', duration: '약 1시간', thumbnail: oido, hashtags: ['일몰', '해안도로'] },
  { id: 'bukhan', name: '남양주 북한강 카페거리', region: '경기 남양주시', duration: '약 50분', thumbnail: bukhan, hashtags: ['리버뷰', '카페투어'] },
  { id: 'mongsanpo', name: '태안 몽산포 캠핑장', region: '충남 태안군', duration: '약 3시간', thumbnail: mongsanpo, hashtags: ['차박', '바다'] },
]

const MENUS = [
  { name: '돼지고기 김치찌개', description: '얼큰한 김치찌개와 갓 지은 솥밥', image: m1 },
  { name: '돈가츠 오므라이스', description: '돈가츠와 부드러운 오므라이스', image: m2 },
  { name: '숯불고기 물냉면', description: '시원한 냉면에 숯불고기', image: m3 },
  { name: '묵은지 김치찜 솥밥', description: '깊은 맛의 묵은지와 돼지목살', image: m4 },
]

const REST_STOP_NAMES: [string, string][] = [
  ['시흥하늘휴게소', '수도권제1순환고속도로'],
  ['안산휴게소', '영동고속도로'],
  ['화성휴게소', '서해안고속도로'],
  ['행담도휴게소', '서해안고속도로'],
  ['서산휴게소', '서해안고속도로'],
  ['덕평자연휴게소', '영동고속도로'],
  ['여주휴게소', '영동고속도로'],
  ['횡성휴게소', '영동고속도로'],
  ['평창휴게소', '영동고속도로'],
  ['강릉휴게소', '영동고속도로'],
  ['가평휴게소', '서울양양고속도로'],
  ['내린천휴게소', '서울양양고속도로'],
  ['이천휴게소', '중부고속도로'],
  ['망향휴게소', '경부고속도로'],
  ['천안삼거리휴게소', '경부고속도로'],
  ['죽전휴게소', '경부고속도로'],
]

export const MOCK_REST_STOPS: RestStop[] = REST_STOP_NAMES.map(([name, highway], i) => ({
  id: `rs-${i + 1}`,
  name,
  highway,
  description: '맛있는 음식부터 쇼핑과 문화생활까지 한곳에서!\n드라이브 중 잠시 들러 특별한 휴식을 즐겨보세요.',
  position: { lat: 37.39 - i * 0.03, lng: 126.8 + i * 0.05 },
  menus: MENUS,
  stampColor: i % 3 === 1 ? 'pink' : 'orange',
}))

/** 이미 획득한 스탬프 (목업) */
export const MOCK_STAMPS: Record<string, string> = {
  'rs-1': '2026-10-20T10:00:00.000Z',
  'rs-2': '2026-10-23T10:00:00.000Z',
  'rs-3': '2026-10-25T10:00:00.000Z',
}

const albums = [a1, a2, a3, a4, a5, a6, a7]
const TRACKS: [string, string, number][] = [
  ['너의 모든 순간', '성시경', 280],
  ['Love wins all', '아이유', 272],
  ['사랑은 늘 도망가', '임영웅', 272],
  ['첫 눈', 'EXO', 272],
  ['눈사람', '정승환', 272],
  ['걘 아니야', '지코', 272],
  ['To. X', '태연', 272],
  ['밤편지', '아이유', 253],
  ['봄날', 'BTS', 274],
  ['Hype Boy', 'NewJeans', 179],
  ['사건의 지평선', '윤하', 300],
  ['Drive', '이소라', 260],
  ['노을', 'AKMU', 296],
]

export const MOCK_TRACKS: Track[] = TRACKS.map(([title, artist, duration], i) => ({
  id: `t${i + 1}`,
  title,
  artist,
  duration,
  albumArt: albums[i % albums.length],
}))

export const MOCK_STORIES: RadioStory[] = [
  '오늘 날씨가 너무 좋아서...',
  '바다 가는 길에 노래를 듣다가...',
  '어느덧 함께 한 지 백일이...',
  '솔로천국 커플지옥이라는...',
  '왜 그렇게 생각하는데 ...',
  '찬성입장도 생각을 ...',
  '두 입장 중 뭐가 더 ...',
  '배가 너무 고파서...',
].map((text, i) => ({ id: `story-${i + 1}`, text, script: djScript(text), createdAt: `2026-10-${20 - i}` }))

export function djScript(text: string): string {
  return `안녕하세요, 여러분! 붕붕이 DJ입니다. 🎙️\n오늘은 연인과 함께 바다로 드라이브를 떠난 한 분의 사연을 소개해 드릴게요.\n\n“${text}”\n\n참 따뜻한 사연이죠? 이 이야기를 들으니 저까지 마음이 몽글몽글해지네요.\n지금 옆에 있는 사람에게 짧게라도 고맙다는 말 한마디 건네 보는 건 어떨까요?\n두 분의 드라이브가 행복한 순간들로 가득하길 바라겠습니다.`
}

export const RANDOM_STORIES = [
  '연애 초반, 처음으로 둘이 떠난 드라이브에서 길을 잘못 들어 세 시간을 헤맸어요. 그런데 그때 본 노을이 아직도 제일 예뻤던 것 같아요.',
  '운전 연습을 도와주던 남자친구가 한 번도 화내지 않았던 게 너무 고마워요.',
  '휴게소 호두과자를 사이좋게 나눠 먹다가 마지막 하나로 가위바위보를 했어요.',
]

export const BALANCE_QUESTIONS: BalanceQuestion[] = [
  ['드라이브 중\n하나만 가능하다면?', '음악 없이\n드라이브 3시간', '대화 없이\n드라이브 3시간'],
  ['휴게소에서\n딱 하나만 먹는다면?', '호두과자', '알감자'],
  ['더 설레는 드라이브는?', '밤바다 드라이브', '벚꽃길 드라이브'],
  ['여행 스타일은?', '계획대로\n착착', '발길 닿는 대로'],
  ['더 참기 힘든 것은?', '꽉 막힌\n도로', '배고픈\n상태'],
  ['데이트 사진은?', '풍경 위주', '인물 위주'],
  ['차 안 온도는?', '조금 춥게', '조금 덥게'],
  ['드라이브 간식은?', '달달한 젤리', '짭짤한 과자'],
  ['더 좋은 드라이브 시간은?', '해 뜰 무렵', '해 질 무렵'],
  ['연인이 졸려 할 때?', '노래를\n크게 튼다', '수다를\n떤다'],
].map(([question, a, b], i) => ({ id: `b${i + 1}`, question, a, b }))

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  ['세상에서 가장 추운 바다는?', '썰렁해', 'ㅆㄹㅎ'],
  ['세상에서 가장 뜨거운 과일은?', '천도복숭아', 'ㅊㄷㅂㅅㅇ'],
  ['왕이 넘어지면?', '킹콩', 'ㅋㅋ'],
  ['세상에서 가장 쉬운 숫자는?', '190000', 'ㅅㄱㅁ'],
  ['비가 오면 신나는 사람은?', '우산장수', 'ㅇㅅㅈㅅ'],
  ['차가 웃으면?', '카카카', 'ㅋㅋㅋ'],
  ['딸기가 직장을 잃으면?', '딸기시럽', 'ㄸㄱㅅㄹ'],
  ['바나나가 웃으면?', '바나나킥', 'ㅂㄴㄴㅋ'],
  ['오리가 얼면?', '언덕', 'ㅇㄷ'],
  ['소가 웃는 소리는?', '우하하', 'ㅇㅎㅎ'],
].map(([question, answer, hint], i) => ({ id: `q${i + 1}`, question, answer, hint }))

export const MEMORY_QUESTIONS: MemoryQuestion[] = [
  '우리가 가장 먼저 기록한\n드라이브 장소는 어디였을까요?',
  '우리의 첫 데이트 장소는\n어디였을까요?',
  '가장 최근에 함께 들은\n노래는 무엇일까요?',
  '처음으로 같이 간\n휴게소는 어디였을까요?',
  '우리가 함께 본\n첫 영화는?',
  '함께 먹은 음식 중\n가장 맛있었던 것은?',
  '서로에게 처음 준\n선물은 무엇이었을까요?',
  '가장 오래 운전한\n드라이브 코스는?',
  '처음 손잡은 장소는\n어디였을까요?',
  '우리의 기념일은\n언제일까요?',
].map((question, i) => ({ id: `m${i + 1}`, question }))
