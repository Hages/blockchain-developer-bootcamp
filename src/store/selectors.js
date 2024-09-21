import { ethers } from "ethers";
import { get, groupBy, reject } from "lodash";
import moment from "moment";
import { createDraftSafeSelector } from "@reduxjs/toolkit";

const GREEN = "#25CE8F";
const RED = "#F45353";

const tokens = (state) => get(state, "tokens.contracts");
const allOrders = (state) => get(state, "exchange.allOrders.data", []);
const cancelledOrders = (state) =>
  get(state, "exchange.cancelledOrders.data", []);
const filledOrders = (state) => get(state, "exchange.filledOrders.data", []);
const openOrders = (state) => {
  const all = allOrders(state);
  const cancelled = cancelledOrders(state);
  const filled = filledOrders(state);

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some(
      (o) => o._id.toString() === order._id.toString()
    );
    const orderCancelled = cancelled.some(
      (o) => o._id.toString() === order._id.toString()
    );
    return orderFilled || orderCancelled;
  });

  return openOrders;
};

const decorateOrder = (order, tokens) => {
  let token0Amt, token1Amt;

  if (order._tokenGive === tokens[0].address) {
    token0Amt = order._amountGet;
    token1Amt = order._amountGive;
  }

  if (order._tokenGive === tokens[1].address) {
    token0Amt = order._amountGive;
    token1Amt = order._amountGet;
  }

  const precision = 100000;
  let tokenPrice = Math.round((token1Amt / token0Amt) * precision) / precision;

  return {
    ...order,
    token0Amt: ethers.utils.formatUnits(token0Amt, "ether"),
    token1Amt: ethers.utils.formatUnits(token1Amt, "ether"),
    tokenPrice,
    formattedTimestamp: moment
      .unix(order._timestamp)
      .format("h:mm:ssa YYYY MMM D"),
  };
};

const decorateOrderBookOrder = (order, tokens) => {
  const type = order._tokenGet === tokens[0].address ? "buy" : "sell";

  return {
    ...order,
    type,
    color: type === "buy" ? GREEN : RED,
    fillAction: type === "buy" ? "sell" : "buy",
  };
};

export const orderBookSelector = createDraftSafeSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) return;

    orders = orders.filter(
      (o) =>
        o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address
    );

    orders = orders.map((order) => {
      order = decorateOrder(order, tokens);
      order = decorateOrderBookOrder(order, tokens);
      return order;
    });

    orders = groupBy(orders, "type");

    const buyOrders = get(orders, "buy", []);
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    const sellOrders = get(orders, "sell", []);
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    return orders;
  }
);
