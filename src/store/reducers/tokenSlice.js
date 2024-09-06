import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "tokens",
  initialState: { loaded: false, contract: null },
  reducers: {
    tokenLoaded: (state, action) => {
      return {
        ...state,
        loaded: true,
        contract: action.payload.token,
        symbol: action.payload.symbol,
      };
    },
  },
});

export const { tokenLoaded } = tokenSlice.actions;

export default tokenSlice.reducer;
