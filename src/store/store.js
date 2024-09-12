import { configureStore } from "@reduxjs/toolkit";
import providerReducer from "./reducers/providerSlice";
import tokenReducer from "./reducers/tokenSlice";
import exchangeReducer from "./reducers/exchangeSlice";

const store = configureStore({
  reducer: {
    provider: providerReducer,
    tokens: tokenReducer,
    exchange: exchangeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload"],
        // Ignore these paths in the state
        ignoredPaths: [
          "provider.connection",
          "tokens.contracts",
          "exchange.contracts",
          "exchange.events",
        ],
      },
    }),
});

export default store;
