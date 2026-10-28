import { daysSince } from './userStore'

describe('daysSince', () => {
  it('연동 당일은 D+1', () => {
    expect(daysSince('2026-10-28', new Date(2026, 9, 28, 15))).toBe(1)
  })
  it('22일 뒤는 D+23', () => {
    expect(daysSince('2026-10-06', new Date(2026, 9, 28))).toBe(23)
  })
})
