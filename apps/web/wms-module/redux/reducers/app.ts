import { APP_SET_IS_TON } from '../actions/app';

const initialState = {
  isTon: false,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case APP_SET_IS_TON:
      return {
        ...state,
        isTon: action.payload.isTon,
      };

    default:
      return state;
  }
}
