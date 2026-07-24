import { Fragment } from 'react'
import { CommonType } from '#types/common'
import { TDetailEntity } from '#types/entity'

import EntityDetailInformation from '../Detail/EntityDetailInformation'
import EntityDetailProgram from '../Detail/EntityDetailProgram'
import EntityDetailUser from '../Detail/EntityDetailUser'

const EntityDetailInformationContent: React.FC<
  CommonType & { entity?: TDetailEntity }
> = ({ isGlobal, entity }) => (
  <Fragment>
    <EntityDetailInformation entity={entity} isGlobal={isGlobal} />

    {isGlobal && <EntityDetailProgram entity={entity} />}

    <EntityDetailUser isGlobal={isGlobal} />
  </Fragment>
)

export default EntityDetailInformationContent
