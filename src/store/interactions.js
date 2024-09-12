import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";
import {
  providerLoaded,
  networkLoaded,
  accountLoaded,
  etherBalanceLoaded,
} from "./reducers/providerSlice";
import { tokenLoaded, tokenBalanceLoaded } from "./reducers/tokenSlice";
import {
  exchangeLoaded,
  exchangeTokenBalanceLoaded,
  transferRequest,
  transferSuccess,
  transferFail,
} from "./reducers/exchangeSlice";

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
  dispatch(tokenLoaded({ token, symbol, append: false }));

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol = await token.symbol();
  dispatch(tokenLoaded({ token, symbol, append: true }));

  return token;
};

export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
  dispatch(exchangeLoaded({ exchange }));

  return exchange;
};

export const subscribeToEvents = (exchange, dispatch) => {
  exchange.on("Deposit", (_token, _user, _amount, _balance, event) => {
    dispatch(transferSuccess({ event }));
  });
};

export const loadBalances = async (exchange, tokens, account, dispatch) => {
  let balance = ethers.utils.formatUnits(
    await tokens[0].balanceOf(account),
    18
  );
  dispatch(tokenBalanceLoaded({ balance, append: false }));

  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[0].address, account),
    18
  );
  dispatch(exchangeTokenBalanceLoaded({ balance, append: false }));

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
  dispatch(tokenBalanceLoaded({ balance, append: true }));

  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[1].address, account),
    18
  );
  dispatch(exchangeTokenBalanceLoaded({ balance, append: true }));
};

export const transferTokens = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  dispatch
) => {
  let transaction;

  dispatch(transferRequest());

  try {
    const signer = await provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

    transaction = await token
      .connect(signer)
      .approve(exchange.address, amountToTransfer);
    await transaction.wait();

    transaction = await exchange
      .connect(signer)
      .depositToken(token.address, amountToTransfer);
    await transaction.wait();
  } catch (error) {
    console.log(error);
    dispatch(transferFail());
  }
};
