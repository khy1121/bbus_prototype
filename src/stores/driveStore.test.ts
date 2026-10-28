import { DEFAULT_DRIVE_NAME, useDriveStore } from './driveStore'

const destination = { id: 'oido', name: '시흥 오이도', address: '경기 시흥시', position: { lat: 37.34, lng: 126.68 } }

describe('driveStore', () => {
  beforeEach(() => useDriveStore.getState().endDrive())

  it('이름 없이 시작하면 기본 드라이브명을 쓴다', () => {
    useDriveStore.getState().startDrive({ name: '   ' })
    const s = useDriveStore.getState()
    expect(s.driveName).toBe(DEFAULT_DRIVE_NAME)
    expect(s.status).toBe('ready')
    expect(s.destination).toBeNull()
  })

  it('목적지와 함께 시작하면 바로 driving 상태가 된다', () => {
    useDriveStore.getState().startDrive({ name: '우리의 첫 바다 드라이브', destination })
    const s = useDriveStore.getState()
    expect(s.driveName).toBe('우리의 첫 바다 드라이브')
    expect(s.destination).toEqual(destination)
    expect(s.status).toBe('driving')
  })

  it('목적지를 설정하면 driving, 일시정지/재개가 가능하다', () => {
    const st = useDriveStore.getState()
    st.startDrive({ name: 'a' })
    st.setDestination(destination)
    expect(useDriveStore.getState().status).toBe('driving')
    useDriveStore.getState().pause()
    expect(useDriveStore.getState().status).toBe('paused')
    useDriveStore.getState().resume()
    expect(useDriveStore.getState().status).toBe('driving')
  })

  it('드라이브명을 수정할 수 있다', () => {
    useDriveStore.getState().startDrive({ name: 'a' })
    useDriveStore.getState().renameDrive('우리의 첫 바다 드라이브')
    expect(useDriveStore.getState().driveName).toBe('우리의 첫 바다 드라이브')
  })

  it('endDrive 는 초기 상태로 되돌린다', () => {
    useDriveStore.getState().startDrive({ name: 'a', destination })
    useDriveStore.getState().endDrive()
    const s = useDriveStore.getState()
    expect(s.status).toBe('idle')
    expect(s.destination).toBeNull()
  })

  it('출발지는 기본 내 위치(null)이고, 장소로 바꿀 수 있으며 종료 시 초기화된다', () => {
    const st = useDriveStore.getState()
    st.startDrive({ name: 'a' })
    expect(useDriveStore.getState().origin).toBeNull()
    useDriveStore.getState().setOrigin(destination)
    expect(useDriveStore.getState().origin).toEqual(destination)
    useDriveStore.getState().endDrive()
    expect(useDriveStore.getState().origin).toBeNull()
  })
})
