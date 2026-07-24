import { getReactSelectValue } from "#utils/react-select";
import { TLPLPOFilter } from "./lplpo.type";

export function handleFilter(filter: TLPLPOFilter, type:string = '') {
  return {
    province_id: getReactSelectValue(filter?.province),
    regency_id: getReactSelectValue(filter?.regency),
    subdistrict_id: getReactSelectValue(filter?.subdistrict),
    activity_id: getReactSelectValue(filter?.activity),
    entity_id: type === 'all' ? null : getReactSelectValue(filter?.entity),
    start_date: filter?.date?.start?.toString(),
    end_date: filter?.date?.end?.toString(),
  }
}