import { NextRouter } from 'next/router'

import { TLeftMenu } from './navbar.types'

export const filterLeftMenus = (leftMenus: Array<TLeftMenu> | []) =>
  leftMenus
    ?.map((parent) => ({
      ...parent,
      sub: (parent?.sub ?? [])
        .map((subItem) => ({
          ...subItem,
          subChild:
            subItem?.subChild?.filter(
              (child: any) => !child.isHidden && child?.url !== 'skipped'
            ) ?? [],
          isHidden:
            subItem?.subChild?.every((child: any) => child.isHidden) ||
            subItem?.isHidden,
        }))
        .filter(
          (subItem) =>
            Array.isArray(subItem?.subChild) &&
            subItem.subChild.length > 0 &&
            !subItem.isHidden
        ),
    }))
    ?.filter((parent) => parent.sub.length > 0 && !parent.isHidden) || []

export const isActiveMenu = (
  router: NextRouter,
  leftMenus: Array<TLeftMenu>
) => {
  const path = router?.asPath
  return leftMenus?.some(
    (menu: {
      sub: Array<{
        subChild: Array<{
          url: string
        }>
      }>
    }) =>
      menu?.sub.some((sub) =>
        sub.subChild.some((child) => path.includes(child.url))
      )
  )
}

export const convertRgbToHex = (rgb: string): string => {
  const result = rgb.match(/\d+/g)
  if (!result || result.length < 3) return '#000000'
  return `#${result
    ?.slice(0, 3)
    ?.map((num) => parseInt(num, 10).toString(16).padStart(2, '0'))
    .join('')}`
}

export const filterSingleMenus = (leftMenus?: Array<TLeftMenu>) =>
  Array.isArray(leftMenus)
    ? leftMenus.filter((menu) => !menu?.isHidden && menu?.url !== 'skipped')
    : []

export const isActiveSingleMenu = (
  router: NextRouter,
  leftMenus: Array<TLeftMenu> = []
) => {
  const path = router?.asPath || ''
  return leftMenus.some((menu) => path.includes(menu?.url ?? ''))
}

export default {}
