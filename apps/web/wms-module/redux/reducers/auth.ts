import { AUTH_CHECK_TOKEN, AUTH_RESULT_CHECK_TOKEN } from './../actions/auth';

const initialState = {
  isProcessCheckToken: false,
  data_login: null,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case AUTH_CHECK_TOKEN:
      return {
        ...state,
        isProcessCheckToken: true,
      };

    case AUTH_RESULT_CHECK_TOKEN:
      return {
        ...state,
        isProcessCheckToken: false,
        data_login: action.payload.data,
      };

    default:
      return state;
  }
}
