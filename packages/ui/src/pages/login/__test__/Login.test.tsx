import '../../../__mocks__/common.mock'
import '../../../__mocks__/matchMedia.mock'
import '../../../__mocks__/router.mock'
import '../../../__mocks__/reactQuery.mock'
import '../../../__mocks__/i18next.mock'
import '../../../__mocks__/firebase.mock'

import '@testing-library/jest-dom'
import React from 'react'
import { render, fireEvent, queryByAttribute } from '@testing-library/react'
import Page from '../LoginPage'
import { useTranslation } from 'react-i18next'

import EN from '../locales/en.json'
import ID from '../locales/id.json'
import { tMock } from '#utils/testing'

const langData = {
  EN,
  ID,
}

describe('Login Page', () => {
  it('renders Login unchanged with translation id', () => {
    const useTranslationSpy = useTranslation
    const tSpy = jest.fn((str, defaultVal) => tMock(str, defaultVal, langData, 'ID'))
    useTranslationSpy.mockReturnValue({
      t: tSpy,
      i18n: { language: 'id' },
    })

    const { container } = render(<Page />)
    expect(container).toMatchSnapshot()
  })

  it('renders Login unchanged with translation en', () => {
    const useTranslationSpy = useTranslation
    const tSpy = jest.fn((str, defaultVal) => tMock(str, defaultVal, langData, 'EN'))
    useTranslationSpy.mockReturnValue({
      t: tSpy,
      i18n: { language: 'en' },
    })

    const { container } = render(<Page />)
    expect(container).toMatchSnapshot()
  })

  it('should button submit not disabled when input are filled', () => {
    expect.assertions(5);
    const useTranslationSpy = useTranslation
    const tSpy = jest.fn((str, defaultVal) => tMock(str, defaultVal, langData, 'EN'))
    useTranslationSpy.mockReturnValue({
      t: tSpy,
      i18n: { language: 'en' },
    })

    const { container } = render(<Page />)
    const getById = queryByAttribute.bind(null, 'id');
    
    //check for submit button
    const submitButton = getById(container, 'btnLogin')

    const iUsername = getById(container, 'username')
    const iPassword = getById(container, 'password')

    expect(iUsername).toBeInTheDocument()
    expect(iPassword).toBeInTheDocument()

    fireEvent.change(iUsername, { target: { value: 'username' } });
    fireEvent.change(iPassword, { target: { value: 'password' } });

    if (iUsername.value && iPassword.value) submitButton?.removeAttribute('disabled')

    expect(iUsername).toHaveDisplayValue('username')
    expect(iPassword).toHaveDisplayValue('password')
    expect(submitButton).not.toBeDisabled()
  })

  it('should button submit disabled when input arent filled', () => {
    expect.assertions(3);
    const useTranslationSpy = useTranslation
    const tSpy = jest.fn((str, defaultVal) => tMock(str, defaultVal, langData, 'EN'))
    useTranslationSpy.mockReturnValue({
      t: tSpy,
      i18n: { language: 'en' },
    })

    const { container } = render(<Page />)
    const getById = queryByAttribute.bind(null, 'id');
    
    //check for submit button
    const submitButton = getById(container, 'btnLogin')

    const iUsername = getById(container, 'username')
    const iPassword = getById(container, 'password')

    expect(iUsername).toBeInTheDocument()
    expect(iPassword).toBeInTheDocument()

    fireEvent.change(iUsername, { target: { value: '' } });
    fireEvent.change(iPassword, { target: { value: '' } });

    if (iUsername.value && iPassword.value) submitButton?.removeAttribute('disabled')

    expect(submitButton).toBeDisabled()
  })
})