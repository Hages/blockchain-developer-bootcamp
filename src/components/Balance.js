import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadBalances, transferTokens } from "../store/interactions";
import hages from "../assets/hages.svg";
import eth from "../assets/eth.svg";

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true);
  const [token0Amt, setToken0Amt] = useState(0);
  const [token1Amt, setToken1Amt] = useState(0);
  const depositRef = useRef(null);
  const withdrawRef = useRef(null);
  const dispatch = useDispatch();
  const symbols = useSelector((state) => state.tokens.symbols);
  const exchange = useSelector((state) => state.exchange.contracts);
  const tokens = useSelector((state) => state.tokens.contracts);
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const tokenBalances = useSelector((state) => state.tokens.balances);
  const exchangeBalances = useSelector((state) => state.exchange.balances);
  const transferInProgress = useSelector(
    (state) => state.exchange.transferInProgress
  );

  useEffect(() => {
    if (exchange && tokens && tokens.length > 1 && account)
      loadBalances(exchange, tokens, account, dispatch);
  }, [exchange, tokens, account, dispatch, transferInProgress]);

  const amountHandler = async (e, token) => {
    if (token.address === tokens[0].address) setToken0Amt(e.target.value);
    if (token.address === tokens[1].address) setToken1Amt(e.target.value);
  };

  const depositHandler = async (e, token) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, "deposit", token, token0Amt, dispatch);
      setToken0Amt(0);
    }
    if (token.address === tokens[1].address) {
      transferTokens(provider, exchange, "deposit", token, token1Amt, dispatch);
      setToken1Amt(0);
    }
  };

  const withdrawHandler = async (e, token) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      transferTokens(
        provider,
        exchange,
        "withdraw",
        token,
        token0Amt,
        dispatch
      );
      setToken0Amt(0);
    }
    if (token.address === tokens[1].address) {
      transferTokens(
        provider,
        exchange,
        "withdraw",
        token,
        token1Amt,
        dispatch
      );
      setToken1Amt(0);
    }
  };

  const tabHandler = (e) => {
    depositRef.current.className = withdrawRef.current.className = "tab";
    e.target.className = "tab tab--active";
    setIsDeposit(e.target.className === depositRef.current.className);
  };

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button
            onClick={tabHandler}
            ref={depositRef}
            className="tab tab--active"
          >
            Deposit
          </button>
          <button onClick={tabHandler} ref={withdrawRef} className="tab">
            Withdraw
          </button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={hages} alt="Token logo" />
            {symbols && symbols[0]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[0]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            isDeposit
              ? depositHandler(e, tokens[0])
              : withdrawHandler(e, tokens[0]);
          }}
        >
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.0000"
            value={token0Amt === 0 ? "" : token0Amt}
            onChange={(e) => {
              amountHandler(e, tokens[0]);
            }}
          />

          <button className="button" type="submit">
            <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={eth} alt="Token logo" />
            {symbols && symbols[1]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[1]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[1]}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            isDeposit
              ? depositHandler(e, tokens[1])
              : withdrawHandler(e, tokens[1]);
          }}
        >
          <label htmlFor="token1"></label>
          <input
            type="text"
            id="token1"
            placeholder="0.0000"
            value={token1Amt === 0 ? "" : token1Amt}
            onChange={(e) => {
              amountHandler(e, tokens[1]);
            }}
          />

          <button className="button" type="submit">
            <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
