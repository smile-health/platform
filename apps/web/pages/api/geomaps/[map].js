export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { map } = req.query

  try {
    const response = await fetch(`${process.env.GEOJSON_MAPS_URL}/${map}.json`)

    if (!response.ok) {
      return res.status(404).json({ error: 'Map not found' })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching map:', error)
    return res.status(500).json({ error: 'Failed to fetch map' })
  }
}
