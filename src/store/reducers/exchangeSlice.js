import { createSlice } from "@reduxjs/toolkit";

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState: {
    loaded: false,
    contracts: null,
    transaction: { isSuccessful: false },
    allOrders: { loaded: false, data: [] },
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

    newOrderRequest: (state) => {
      return {
        ...state,
        transaction: {
          type: "New Order",
          isPending: true,
          isSuccessful: false,
        },
      };
    },

    newOrderSuccess: (state, action) => {
      let index = state.allOrders.data.findIndex(
        (order) => order._id === action.payload.order._id
      );

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data:
            index >= 0
              ? [...state.allOrders.data]
              : [...state.allOrders.data, action.payload.order],
        },
        transaction: {
          type: "New Order",
          isPending: false,
          isSuccessful: true,
        },
        events: [action.payload.event, ...state.events],
      };
    },

    newOrderFail: (state, action) => {
      return {
        ...state,
        transaction: {
          type: "New Order",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
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
  newOrderRequest,
  newOrderSuccess,
  newOrderFail,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
