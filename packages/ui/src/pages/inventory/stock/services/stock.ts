import { getMaterials, GetMaterialsParams } from '#services/material'

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional?: {
    page: number | undefined
    material_level_id: string
  }
) {
  let params: GetMaterialsParams = {
    ...additional,
    page: additional?.page ?? 1,
    paginate: 10,
    keyword,
    material_level_id: additional?.material_level_id,
  }

  const result = await getMaterials(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page ? additional?.page + 1 : 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page ? additional?.page + 1 : 1,
      material_level_id: params.material_level_id,
    },
  }
}
