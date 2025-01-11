import { ethers } from "ethers";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import moment from "moment";
import { createDraftSafeSelector } from "@reduxjs/toolkit";

const GREEN = "#25CE8F";
const RED = "#F45353";

const account = (state) => get(state, "provider.account");
const tokens = (state) => get(state, "tokens.contracts");
const events = (state) => get(state, "exchange.events");
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

const decorateMyOpenOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyOpenOrder(order, tokens);
    return order;
  });
};

const decorateMyOpenOrder = (order, tokens) => {
  let orderType = order._tokenGive === tokens[1].address ? "buy" : "sell";

  return {
    ...order,
    orderType,
    color: orderType === "buy" ? GREEN : RED,
  };
};

const decorateMyFilledOrders = (orders, account, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyFilledOrder(order, account, tokens);
    return order;
  });
};

const decorateMyFilledOrder = (order, account, tokens) => {
  const myOrder = order._creator === account;

  let orderType;

  if (myOrder) {
    orderType = order._tokenGive === tokens[1].address ? "buy" : "sell";
  } else {
    orderType = order._tokenGive === tokens[1].address ? "sell" : "buy";
  }

  return {
    ...order,
    orderType,
    orderSign: orderType === "buy" ? "+" : "-",
    color: orderType === "buy" ? GREEN : RED,
  };
};

const decorateFilledOrders = (orders, tokens) => {
  let previousOrder = orders[0];

  return (orders = orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order;
    return order;
  }));
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    color: tokenPriceColor(order.tokenPrice, order._id, previousOrder),
  };
};

const tokenPriceColor = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder._id === orderId) {
    return GREEN;
  }

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN;
  } else {
    return RED;
  }
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

const buildGraphData = (orders) => {
  orders = groupBy(orders, (order) =>
    moment.unix(order._timestamp).startOf("hour").format()
  );

  const hours = Object.keys(orders);
  const graphData = hours.map((hour) => {
    const group = orders[hour];
    const open = group[0];
    const high = maxBy(group, "tokenPrice");
    const low = minBy(group, "tokenPrice");
    const close = group[group.length - 1];

    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    };
  });

  return graphData;
};

export const myEventsSelector = createDraftSafeSelector(
  account,
  events,
  (account, events) => {
    events = events.filter((e) => e.args._user === account);

    return events;
  }
);

export const myOpenOrdersSelector = createDraftSafeSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) return;

    orders = orders.filter((o) => o._user === account);

    orders = orders.filter(
      (o) =>
        o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address
    );

    orders = decorateMyOpenOrders(orders, tokens);

    orders.sort((a, b) => b._timestamp - a._timestamp);

    return orders;
  }
);

export const myFilledOrdersSelector = createDraftSafeSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) return;

    orders = orders.filter(
      (o) => o._user === account || o._creator === account
    );

    orders = orders.filter(
      (o) =>
        o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address
    );

    orders.sort((a, b) => b._timestamp - a._timestamp);

    orders = decorateMyFilledOrders(orders, account, tokens);

    return orders;
  }
);

export const filledOrdersSelector = createDraftSafeSelector(
  filledOrders,
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

    orders.sort((a, b) => a._timestamp - b._timestamp);

    orders = decorateFilledOrders(orders, tokens);

    orders.sort((a, b) => b._timestamp - a._timestamp);

    return orders;
  }
);

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

export const priceChartSelector = createDraftSafeSelector(
  filledOrders,
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

    orders.sort((a, b) => a._timestamp - b._timestamp);

    orders = orders.map((order) => {
      order = decorateOrder(order, tokens);
      return order;
    });

    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(
      orders.length - 2,
      orders.length
    );

    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);
    const lastPrice = get(lastOrder, "tokenPrice", 0);

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
      series: [{ data: buildGraphData(orders) }],
    };
  }
);
