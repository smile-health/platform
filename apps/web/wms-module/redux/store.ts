import { Context, createWrapper, HYDRATE, MakeStore } from 'next-redux-wrapper';
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import app from './reducers/app';
import auth from './reducers/auth';

// Root Reducer
const combinedReducer = combineReducers({
  auth,
  app,
});

// RootState type
export type RootState = ReturnType<typeof combinedReducer>;

// HYDRATE-aware reducer
const reducer = (
  state: RootState | undefined,
  action: AnyAction
): RootState => {
  if (action.type === HYDRATE) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return combinedReducer(state, action);
};

// Middleware
const bindMiddleware = (middleware: Array<ThunkMiddleware<RootState>>): any => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

// Store initializer
export const makeStore: MakeStore<RootState> = (context: Context) => {
  const store = createStore(reducer, bindMiddleware([thunkMiddleware]));

  return store;
};

// Next.js wrapper
export const wrapper = createWrapper<RootState>(makeStore);
