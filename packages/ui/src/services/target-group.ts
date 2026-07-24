import axios from '#lib/axios'

export type TMaterialType = {
  id: number
  title: string
}

export async function getListTargetGroup() {
  const response = await axios.get('/main/microplanning/target-groups')

  return response
}

export async function loadMoreTargetGroup() {

  const result = await getListTargetGroup()

  const data = Array.isArray(result.data) ? result.data : []

  const options = data.map((item) => ({
    value: item.id,
    label: item.title,
  }))


  return {
    options
  }
}
