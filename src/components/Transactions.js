import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  myOpenOrdersSelector,
  myFilledOrdersSelector,
} from "../store/selectors";
import sort from "../assets/sort.svg";
import Banner from "./Banner";

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true);
  const symbols = useSelector((state) => state.tokens.symbols);
  const openOrders = useSelector(myOpenOrdersSelector);
  const filledOrders = useSelector(myFilledOrdersSelector);

  const orderRef = useRef(null);
  const tradeRef = useRef(null);

  const tabHandler = (e) => {
    if (e.target.className !== orderRef.current.className) {
      orderRef.current.className = "tab";
      setShowMyOrders(false);
    } else {
      tradeRef.current.className = "tab";
      setShowMyOrders(true);
    }
    e.target.className = "tab tab--active";
  };

  return (
    <div className="component exchange__transactions">
      {showMyOrders ? (
        <div>
          <div className="component__header flex-between">
            <h2>My Orders</h2>

            <div className="tabs">
              <button
                onClick={tabHandler}
                ref={orderRef}
                className="tab tab--active"
              >
                Orders
              </button>
              <button onClick={tabHandler} ref={tradeRef} className="tab">
                Trades
              </button>
            </div>
          </div>

          {!openOrders || openOrders.length === 0 ? (
            <Banner text="No Open Orders" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>
                    {symbols && symbols[0]}
                    <img src={sort} alt="Sort" />
                  </th>
                  <th>
                    {symbols && symbols[0]} / {symbols && symbols[1]}
                    <img src={sort} alt="Sort" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {openOrders &&
                  openOrders.map((order, index) => {
                    return (
                      <tr key={index}>
                        <td style={{ color: order.color }}>
                          {order.token0Amt}
                        </td>
                        <td>{order.tokenPrice}</td>
                        <td></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          <div className="component__header flex-between">
            <h2>My Transactions</h2>

            <div className="tabs">
              <button
                onClick={tabHandler}
                ref={orderRef}
                className="tab tab--active"
              >
                Orders
              </button>
              <button onClick={tabHandler} ref={tradeRef} className="tab">
                Trades
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  Time <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[0]} / {symbols && symbols[1]}
                  <img src={sort} alt="Sort" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filledOrders &&
                filledOrders.map((order, index) => {
                  return (
                    <tr>
                      <td key={index}>{order.formattedTimestamp}</td>
                      <td style={{ color: order.color }}>
                        {order.orderSign}
                        {order.token0Amt}
                      </td>
                      <td>{order.tokenPrice}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
