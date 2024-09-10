import { createSlice } from "@reduxjs/toolkit";

export const exchangeSlice = createSlice({
  name: "exchanges",
  initialState: { loaded: false, contracts: null },
  reducers: {
    exchangeLoaded: (state, action) => {
      return {
        ...state,
        loaded: true,
        contracts: action.payload.exchange,
      };
    },
  },
});

export const { exchangeLoaded } = exchangeSlice.actions;

export default exchangeSlice.reducer;
