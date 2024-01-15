import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import vibratingStringReducer from "../features/vibratingString/vibratingStringSlice"

export const store = configureStore({
    reducer: { vibratingString: vibratingStringReducer },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
