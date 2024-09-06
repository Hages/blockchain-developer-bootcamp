import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import {
  providerLoaded,
  networkLoaded,
  accountLoaded,
} from "./reducers/providerSlice";
import { tokenLoaded } from "./reducers/tokenSlice";

export const loadProvider = async (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(providerLoaded(connection));

  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(networkLoaded(chainId));

  return chainId;
};

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(accountLoaded(account));

  return account;
};

export const loadHagesToken = async (provider, address, dispatch) => {
  let token, symbol;
  token = new ethers.Contract(address, TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch(tokenLoaded({ token, symbol }));

  return token;
};
