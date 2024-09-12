import { createSlice } from "@reduxjs/toolkit";

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState: {
    loaded: false,
    contracts: null,
    transaction: { isSuccessful: false },
    events: [],
  },
  reducers: {
    exchangeLoaded: (state, action) => {
      return {
        ...state,
        loaded: true,
        contracts: action.payload.exchange,
      };
    },

    exchangeTokenBalanceLoaded: (state, action) => {
      return {
        ...state,
        balances: action.payload.append
          ? [...state.balances, action.payload.balance]
          : [action.payload.balance],
      };
    },

    transferRequest: (state) => {
      return {
        ...state,
        transaction: {
          type: "Transfer",
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true,
      };
    },

    transferSuccess: (state, action) => {
      return {
        ...state,
        transaction: {
          type: "Transfer",
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.payload.event, ...state.events],
      };
    },

    transferFail: (state, action) => {
      return {
        ...state,
        transaction: {
          type: "Transfer",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
        transferInProgress: false,
      };
    },
  },
});

export const {
  exchangeLoaded,
  exchangeTokenBalanceLoaded,
  transferRequest,
  transferSuccess,
  transferFail,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
