import { Fragment } from 'react';

import EntityDetailInformation from '../Detail/EntityDetailInformation';
import EntityDetailUser from '../Detail/EntityDetailUser';

const EntityDetailInformationContent: React.FC = () => (
  <Fragment>
    <EntityDetailInformation />

    <EntityDetailUser />
  </Fragment>
);

export default EntityDetailInformationContent;
