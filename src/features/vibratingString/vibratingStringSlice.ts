import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

export interface VibratingStringState {
    isVibrating: boolean,
}

const initialState: VibratingStringState = {
    isVibrating: false,
}

export const vibratingStringSlice = createSlice({
    name: "vibratingString",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setIsVibrating: (state, action: PayloadAction<boolean>) => {
            state.isVibrating = action.payload
        },
    },
})

export const { setIsVibrating } = vibratingStringSlice.actions

export const selectIsVibrating = (state: RootState) => state.vibratingString.isVibrating

export default vibratingStringSlice.reducer
