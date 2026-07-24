import en from './en';
import id from './id';

type Strings = {
  id: typeof id;
  en: typeof en;
};

const strings: Strings = {
  id,
  en,
};

export default strings;
