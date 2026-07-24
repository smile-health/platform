import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import { TFunction } from 'i18next'

import { VACCINE_METHOD } from './dashboard-rabies.constant'
import {
  TCareCascade,
  TDashboardRabiesFilter,
  TVaccineSequence,
} from './dashboard-rabies.type'

export function handleFilter(filter: TDashboardRabiesFilter) {
  return removeEmptyObject({
    from: filter?.period?.start?.toString(),
    to: filter?.period?.end?.toString(),
    entity_tag_ids: getReactSelectValue(filter?.entity_tags),
    province_ids: getReactSelectValue(filter?.provinces),
    regency_ids: getReactSelectValue(filter?.regencies),
    entity_ids: getReactSelectValue(filter?.entities),
    vaccine_method:
      filter?.vaccine_method === '0' ? '' : filter?.vaccine_method,
    gender: filter?.gender === '0' ? '' : filter?.gender,
    identity_type: filter?.identity_type,
    vaccine: filter?.vaccine,
  })
}

export function handleCareCascadeDataChart(
  t: TFunction<'dashboardRabies'>,
  data: TCareCascade[],
) {
  const result = data.reduce((acc, item) => {
    if (!acc.notOnSchedule) acc.notOnSchedule = [item.off_schedule ?? 0]
    else acc.notOnSchedule.push(item.off_schedule ?? 0)

    if (!acc.postOnSchedule) acc.postOnSchedule = [item.on_schedule ?? 0]
    else acc.postOnSchedule.push(item.on_schedule ?? 0)

    if (!acc.confirmed) acc.confirmed = [item.confirmed ?? 0]
    else acc.confirmed.push(item.confirmed ?? 0)

    if (!acc.lostToFollowUp) acc.lostToFollowUp = [item.drop ?? 0]
    else acc.lostToFollowUp.push(item.drop ?? 0)

    return acc
  }, {
    notOnSchedule: [],
    postOnSchedule: [],
    confirmed: [],
    lostToFollowUp: [],
  } as { 
    notOnSchedule: number[]
    postOnSchedule: number[]
    confirmed: number[]
    lostToFollowUp: number[]
  })

  const labels = data?.map((item) => item?.title)

  return {
    labels,
    datasets: [
      {
        label: t('label.not_on_schedule'),
        data: result.notOnSchedule,
        backgroundColor: '#D86DCD',
      },
      {
        label: t('label.post_on_schedule'),
        data: result.postOnSchedule,
        backgroundColor: '#004990',
      },
      {
        label: t('label.confirmed'),
        data: result.confirmed,
        backgroundColor: '#00B050',
      },
      {
        label: t('label.loss_to_follow_up'),
        data: result.lostToFollowUp,
        backgroundColor: '#EF476F',
      },
    ],
  }
}

export const handleVaccineSequence = (method?: string) => {
  const PrEP = ['prep1', 'prep2'] satisfies Array<keyof TVaccineSequence>
  const PEP1 = 'var1'
  const PEP2 = 'var2'
  const PEP3 = 'var3'
  const PEP4 = 'var8'
  const Booster = ['booster1', 'booster2'] satisfies Array<
    keyof TVaccineSequence
  >

  let PEP = [PEP1, PEP4, PEP2, PEP3] satisfies Array<keyof TVaccineSequence>

  if (method === VACCINE_METHOD.INTRA_MUSCULAR) {
    PEP = [PEP1, PEP2, PEP3] satisfies Array<keyof TVaccineSequence>
  }

  if (method === VACCINE_METHOD.INTRA_DERMAL) {
    PEP = [PEP1, PEP4, PEP2] satisfies Array<keyof TVaccineSequence>
  }

  return [...PrEP, ...PEP, ...Booster]
}
