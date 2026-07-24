import '../../../__mocks__/common.mock'
import '../../../__mocks__/matchMedia.mock'
import '../../../__mocks__/router.mock'
import '../../../__mocks__/reactQuery.mock'

import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import Page from '../ProgramPage'

describe('Program Page', () => {
  it('should renders correctly', () => {
    const { container } = render(<Page />)
    expect(container).toMatchSnapshot()
  })
})