import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

type Options = RenderOptions & { route?: string }

/** 라우터 컨텍스트 + userEvent 를 함께 제공하는 render 헬퍼 */
export function renderWithRouter(ui: ReactElement, { route = '/', ...options }: Options = {}) {
  return {
    user: userEvent.setup(),
    ...render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, options),
  }
}

export function setup(ui: ReactElement, options?: RenderOptions) {
  return { user: userEvent.setup(), ...render(ui, options) }
}
