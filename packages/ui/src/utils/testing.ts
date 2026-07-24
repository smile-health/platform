import langCommonEN from '../locales/en/common.json'
import langCommonID from '../locales/id/common.json'

const getLangData = <T>(langKey: string, langData: { EN: T, ID: T }, langType: 'ID' | 'EN' = 'EN', withCommonTranslation: boolean = false) => {
    let result: any
    const splitResults = String(langKey).split('.')

    let jsonData = { NS_TRANS: {} }

    if (langType === 'EN') jsonData = { ...langData.EN, NS_TRANS: langCommonEN }
    if (langType === 'ID') jsonData = { ...langData.ID, NS_TRANS: langCommonID }

    if (withCommonTranslation) result = jsonData.NS_TRANS

    splitResults.forEach(x => result = !result ? jsonData[x] : result[x])

    return result
}

export const tMock = <T>(str: string, defaultVal: string | { ns: string, defaultValue: T }, langData: { EN: T, ID: T }, langType: 'ID' | 'EN') => {
    const withCommonTranslation = !!(typeof defaultVal === 'object' && defaultVal.ns && defaultVal.ns === 'common')
    const found = getLangData(str, langData, langType, withCommonTranslation)

    if (found) return found
    if (withCommonTranslation) return defaultVal.defaultValue

    return defaultVal
}