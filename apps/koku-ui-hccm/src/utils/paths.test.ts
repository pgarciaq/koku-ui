import { routePaths } from 'routePaths';
import { formatPath, getReleasePath, usePathname } from './paths'
import { useLocation } from 'react-router-dom'

// 1) single top‐level mock
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useLocation: jest.fn(),
}))
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>

describe('utils/paths', () => {
  const setWindowPathname = (pathname: string) => {
    window.history.replaceState({}, '', pathname)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('formatPath without release prefix', () => {
    expect(formatPath(routePaths.overview.path)).toBe('/openshift/cost-management')
    expect(formatPath(routePaths.costModelBreakdown.basePath))
      .toBe(`/openshift/cost-management${routePaths.costModelBreakdown.basePath}`)
  })

  test.each([
    { pathname: '/beta/openshift/cost-management', expected: '/beta' },
    { pathname: '/preview/openshift/cost-management', expected: '/preview' },
    { pathname: '/openshift/cost-management', expected: '' },
  ])('getReleasePath for $pathname', ({ pathname, expected }) => {
    setWindowPathname(pathname)
    expect(getReleasePath()).toBe(expected)
  })

  test('formatPath with release prefix', () => {
    setWindowPathname('/beta/openshift/cost-management')
    expect(formatPath(routePaths.costModelBreakdown.basePath, true).startsWith('/beta')).toBe(true)
  })

  test('usePathname collapses cost model UUID path', () => {
    const base = formatPath(routePaths.costModelBreakdown.basePath)
    setWindowPathname(`${base}/123`)
    mockUseLocation.mockReturnValue({ pathname: `${base}/123` })
    expect(usePathname()).toBe(base)
  })
})