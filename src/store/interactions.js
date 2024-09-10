import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";
import {
  providerLoaded,
  networkLoaded,
  accountLoaded,
  etherBalanceLoaded,
} from "./reducers/providerSlice";
import { tokenLoaded } from "./reducers/tokenSlice";
import { exchangeLoaded } from "./reducers/exchangeSlice";

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

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(accountLoaded(account));

  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  dispatch(etherBalanceLoaded(balance));

  return account;
};

export const loadTokens = async (provider, addresses, dispatch) => {
  let token, symbol;
  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch(tokenLoaded({ token, symbol }));

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch(tokenLoaded({ token, symbol }));

  return token;
};

export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
  dispatch(exchangeLoaded({ exchange }));

  return exchange;
};
