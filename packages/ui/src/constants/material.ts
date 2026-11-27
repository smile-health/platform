import { t } from 'i18next'

export enum KfaLevelEnum {
  KFA_91 = 1,
  KFA_92 = 2,
  KFA_93 = 3,
  KFA_94 = 4,
}

// label berupa getter supaya mengikuti bahasa aktif saat dibaca; dulu
// dievaluasi sekali saat modul dimuat sehingga selalu bahasa Inggris.
export const KFA_LEVEL = {
  KFA_91: {
    id: KfaLevelEnum.KFA_91,
    get label() {
      return t('material:detail.active_substance')
    },
  },
  KFA_92: {
    id: KfaLevelEnum.KFA_92,
    get label() {
      return t('material:detail.active_substance_and_strength')
    },
  },
  KFA_93: {
    id: KfaLevelEnum.KFA_93,
    get label() {
      return t('material:detail.trademark')
    },
  },
  KFA_94: {
    id: KfaLevelEnum.KFA_94,
    get label() {
      return t('material:detail.packaging')
    },
  },
}

export const kfaLevelList = Object.values(KFA_LEVEL)

export const MATERIAL_HIERARCHY = {
  INGREDIENT: 'ingredient',
  TEMPLATE: 'template',
  VARIANT: 'variant',
  PACKAGING: 'packaging',
}
