import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeBuyOrder, makeSellOrder } from "../store/interactions";

const Order = () => {
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const buyRef = useRef(null);
  const sellRef = useRef(null);
  const dispatch = useDispatch();
  const exchange = useSelector((state) => state.exchange.contracts);
  const tokens = useSelector((state) => state.tokens.contracts);
  const provider = useSelector((state) => state.provider.connection);

  const amountHandler = async (e) => {
    setAmount(e.target.value);
  };

  const priceHandler = async (e) => {
    setPrice(e.target.value);
  };

  const tabHandler = (e) => {
    buyRef.current.className = sellRef.current.className = "tab";
    e.target.className = "tab tab--active";
    setIsBuy(e.target.className === buyRef.current.className);
  };

  const buyHandler = async (e) => {
    e.preventDefault();
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setAmount(0);
    setPrice(0);
  };

  const sellHandler = async (e) => {
    e.preventDefault();
    makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setAmount(0);
    setPrice(0);
  };

  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button onClick={tabHandler} ref={buyRef} className="tab tab--active">
            Buy
          </button>
          <button onClick={tabHandler} ref={sellRef} className="tab">
            Sell
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          isBuy ? buyHandler(e) : sellHandler(e);
        }}
      >
        <label htmlFor="amount">{isBuy ? "Buy Amount" : "Sell Amount"}</label>
        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          value={amount === 0 ? "" : amount}
          onChange={(e) => {
            amountHandler(e);
          }}
        />

        <label htmlFor="amount">{isBuy ? "Buy Price" : "Sell Price"}</label>
        <input
          type="text"
          id="price"
          placeholder="0.0000"
          value={price === 0 ? "" : price}
          onChange={(e) => {
            priceHandler(e);
          }}
        />

        <button className="button button--filled" type="submit">
          <span>{isBuy ? "Buy Order" : "Sell Order"}</span>
        </button>
      </form>
    </div>
  );
};

export default Order;
