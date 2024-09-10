import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "tokens",
  initialState: { loaded: false, contracts: [], symbols: [] },
  reducers: {
    tokenLoaded: (state, action) => {
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.payload.token],
        symbols: [...state.symbols, action.payload.symbol],
      };
    },
  },
});

export const { tokenLoaded } = tokenSlice.actions;

export default tokenSlice.reducer;
