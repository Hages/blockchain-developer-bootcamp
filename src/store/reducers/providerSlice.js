import { createSlice } from "@reduxjs/toolkit";

export const providerSlice = createSlice({
  name: "provider",
  initialState: {},
  reducers: {
    providerLoaded: (state, action) => {
      return { ...state, connection: action.payload };
    },

    networkLoaded: (state, action) => {
      return { ...state, chainId: action.payload };
    },

    accountLoaded: (state, action) => {
      return { ...state, account: action.payload };
    },

    etherBalanceLoaded: (state, action) => {
      return { ...state, balance: action.payload };
    },
  },
});

export const {
  providerLoaded,
  networkLoaded,
  accountLoaded,
  etherBalanceLoaded,
} = providerSlice.actions;

export default providerSlice.reducer;
