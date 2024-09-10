import { configureStore } from "@reduxjs/toolkit";
import providerReducer from "./reducers/providerSlice";
import tokenReducer from "./reducers/tokenSlice";
import exchangeReducer from "./reducers/exchangeSlice";

const store = configureStore({
  reducer: {
    provider: providerReducer,
    token: tokenReducer,
    exchange: exchangeReducer,
  },
});

export default store;
