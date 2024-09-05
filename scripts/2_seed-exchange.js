const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const millseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, millseconds));
};

async function main() {
  const accounts = await ethers.getSigners();

  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chain ID: ${chainId}\n`);

  const hages = await ethers.getContractAt(
    "Token",
    config[chainId].hages.address
  );
  console.log(`HAGES Token fetched: ${hages.address}\n`);

  const mETH = await ethers.getContractAt(
    "Token",
    config[chainId].mETH.address
  );
  console.log(`mETH Token fetched: ${mETH.address}\n`);

  const mDAI = await ethers.getContractAt(
    "Token",
    config[chainId].mDAI.address
  );
  console.log(`mDAI Token fetched: ${mDAI.address}\n`);

  const exchange = await ethers.getContractAt(
    "Exchange",
    config[chainId].exchange.address
  );
  console.log(`Exchange fetched: ${exchange.address}\n`);

  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(
    `Transferred ${amount} mETH tokens from ${sender.address} to ${receiver.address}\n`
  );

  const user1 = accounts[0];
  const user2 = accounts[1];

  transaction = await hages.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} hages tokens from ${user1.address}\n`);

  transaction = await exchange
    .connect(user1)
    .depositToken(hages.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} hages tokens from ${user1.address}\n`);

  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} mETH tokens from ${user2.address}\n`);

  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} mETH tokens from ${user2.address}\n`);

  let orderId;
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), hages.address, tokens(5));
  result = await transaction.wait();
  orderId = result.events[0].args._id;
  console.log(`Made order ${orderId} from ${user1.address}\n`);

  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order ${orderId} from ${user1.address}\n`);

  await wait(1);

  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), hages.address, tokens(10));
  result = await transaction.wait();
  orderId = result.events[0].args._id;
  console.log(`Made order ${orderId} from ${user1.address}\n`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order ${orderId} from ${user2.address}\n`);

  await wait(1);

  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), hages.address, tokens(15));
  result = await transaction.wait();
  orderId = result.events[0].args._id;
  console.log(`Made order ${orderId} from ${user1.address}\n`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order ${orderId} from ${user2.address}\n`);

  await wait(1);

  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), hages.address, tokens(20));
  result = await transaction.wait();
  orderId = result.events[0].args._id;
  console.log(`Made order ${orderId} from ${user1.address}\n`);

  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order ${orderId} from ${user2.address}\n`);

  await wait(1);

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), hages.address, tokens(10));
    result = await transaction.wait();
    orderId = result.events[0].args._id;
    console.log(`Made order ${orderId} from ${user1.address}\n`);

    await wait(1);

    transaction = await exchange
      .connect(user2)
      .makeOrder(hages.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait();
    orderId = result.events[0].args._id;
    console.log(`Made order ${orderId} from ${user2.address}\n`);

    await wait(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
