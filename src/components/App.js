import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";
import {
  loadAccount,
  loadProvider,
  loadNetwork,
  loadTokens,
  loadExchange,
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const provider = await loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });

    const hages = config[chainId].hages;
    const mETH = config[chainId].mETH;

    await loadTokens(provider, [hages.address, mETH.address], dispatch);

    await loadExchange(provider, config[chainId].exchange.address, dispatch);
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

          {/* Balance */}

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;
