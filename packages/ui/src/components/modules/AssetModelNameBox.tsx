import React from 'react'
import { Exists } from '#components/exists'

type AssetModelNameBoxProps = {
  modelName: string
  manufactureName: string
  typeName?: string
}

export const AssetModelNameBox = ({
  modelName,
  manufactureName,
  typeName,
}: AssetModelNameBoxProps) => {
  return (
    <div>
      <Exists useIt={Boolean(modelName)}>
        <p className="text-dark">{modelName}</p>
      </Exists>{' '}
      <Exists useIt={Boolean(typeName)}>
        <p className="text-dark">{typeName}</p>
      </Exists>{' '}
      <Exists useIt={Boolean(manufactureName)}>
        <p className="mt-1 text-gray-500">{manufactureName}</p>
      </Exists>
    </div>
  )
}
