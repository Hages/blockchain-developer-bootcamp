import { configureStore } from "@reduxjs/toolkit";
import providerReducer from "./reducers/providerSlice";
import tokenReducer from "./reducers/tokenSlice";

const store = configureStore({
  reducer: {
    provider: providerReducer,
    token: tokenReducer,
  },
});

export default store;
