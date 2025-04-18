import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";
import {
  loadAccount,
  loadProvider,
  loadNetwork,
  loadTokens,
  loadExchange,
  loadAllOrders,
  subscribeToEvents,
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";
import PriceChart from "./PriceChart";
import Transactions from "./Transactions";
import Trades from "./Trades";
import OrderBook from "./OrderBook";
import Alert from "./Alert";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const provider = await loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    // window.ethereum.on("chainChanged", () => {
    //   console.log("reload");
    //   window.location.reload();
    // });

    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });

    const hages = config[chainId].hages;
    const mETH = config[chainId].mETH;

    if (hages && mETH)
      await loadTokens(provider, [hages.address, mETH.address], dispatch);

    const exchangeConfig = config[chainId].exchange;
    let exchange;
    if (exchangeConfig)
      exchange = await loadExchange(provider, exchangeConfig.address, dispatch);

    loadAllOrders(provider, exchange, dispatch);

    subscribeToEvents(exchange, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />
          <Balance />
          <Order />
        </section>
        <section className="exchange__section--right grid">
          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />
        </section>
      </main>

      <Alert />
    </div>
  );
}

export default App;
