import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "tokens",
  initialState: { loaded: false, contracts: [], symbols: [] },
  reducers: {
    tokenLoaded: (state, action) => {
      return {
        ...state,
        loaded: true,
        contracts: action.payload.append
          ? [...state.contracts, action.payload.token]
          : [action.payload.token],
        symbols: action.payload.append
          ? [...state.symbols, action.payload.symbol]
          : [action.payload.symbol],
      };
    },

    tokenBalanceLoaded: (state, action) => {
      return {
        ...state,
        balances: action.payload.append
          ? [...state.balances, action.payload.balance]
          : [action.payload.balance],
      };
    },
  },
});

export const { tokenLoaded, tokenBalanceLoaded } = tokenSlice.actions;

export default tokenSlice.reducer;
