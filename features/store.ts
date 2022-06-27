import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
//import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  authReducer,
  cartsReducer,
  categoriesReducer,
  foodsReducer,
} from "./reducers";
//import baseApi from "./baseApi";

const persistConfig = {
  key: "root",
  storage,
  whitelist: [],
};

const rootReducer = combineReducers({
  //[baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  categories: categoriesReducer,
  foods: foodsReducer,
  carts: cartsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  //middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware)
});

export let persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

//setupListeners(store.dispatch)
