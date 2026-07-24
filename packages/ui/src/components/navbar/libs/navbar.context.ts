import { createContext } from 'react'

import { TLeftMenu } from './navbar.types'

type Props = {
  menuClicked: TLeftMenu
  setMenuClicked: (value: TLeftMenu) => void
}

export const NavbarContext = createContext<Props>({
  menuClicked: {
    chosenTitle: '',
    sub: [],
  },
  setMenuClicked: () => {},
})
