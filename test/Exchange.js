const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("Exchange", () => {
  let exchange, accounts, deployer, feeAccount, token1, token2, user1, user2;

  const feePercent = 10;

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");

    token1 = await Token.deploy("Hages", "HAGES", 1000000);
    token2 = await Token.deploy("Mock Dai", "mDAI", 1000000);

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];

    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait();

    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("Tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("Tracks the fee percent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Depositing Tokens", () => {
    let transaction, result;
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
      });

      it("Tracks the token deposit", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(amount);
      });

      it("Emits a Deposit event", async () => {
        const event = result.events[1];
        expect(await event.event).to.equal("Deposit");

        const args = event.args;
        expect(await args._token).to.equal(token1.address);
        expect(await args._user).to.equal(user1.address);
        expect(await args._amount).to.equal(amount);
        expect(await args._balance).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("No tokens approved", async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Withdrawing Tokens", () => {
    let transaction, result;
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1.address, amount);
        result = await transaction.wait();
      });

      it("Tracks the token withdrawal", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          0
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(0);
      });

      it("Emits a Withdraw event", async () => {
        const event = result.events[1];
        expect(await event.event).to.equal("Withdraw");

        const args = event.args;
        expect(await args._token).to.equal(token1.address);
        expect(await args._user).to.equal(user1.address);
        expect(await args._amount).to.equal(amount);
        expect(await args._balance).to.equal(0);
      });
    });

    describe("Failure", () => {
      it("Rejects insufficient balance", async () => {
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Check Balances", () => {
    let transaction;
    let amount = tokens(1);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      await transaction.wait();
    });

    it("Returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      );
    });
  });

  describe("Making Orders", () => {
    let transaction, result;
    let amount = tokens(10);

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, tokens(1), token1.address, tokens(1));
        result = await transaction.wait();
      });

      it("Tracks newly created order", async () => {
        expect(await exchange.ordersCount()).to.equal(1);
      });

      it("Emits an Order event", async () => {
        const event = result.events[0];
        expect(await event.event).to.equal("Order");

        const args = event.args;
        expect(await args._id).to.equal(1);
        expect(await args._user).to.equal(user1.address);
        expect(await args._tokenGet).to.equal(token2.address);
        expect(await args._amountGet).to.equal(tokens(1));
        expect(await args._tokenGive).to.equal(token1.address);
        expect(await args._amountGive).to.equal(tokens(1));
        expect(await args._timestamp).to.at.least(1);
      });
    });

    describe("Failure", () => {
      it("Rejects insufficient balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2.address, tokens(1), token1.address, tokens(1))
        ).to.be.reverted;
      });
    });
  });

  describe("Order Actions", () => {
    let transaction, result;
    let amount = tokens(1);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      transaction = await token2
        .connect(deployer)
        .transfer(user2.address, tokens(100));
      result = await transaction.wait();

      transaction = await token2
        .connect(user2)
        .approve(exchange.address, tokens(2));
      result = await transaction.wait();

      transaction = await exchange
        .connect(user2)
        .depositToken(token2.address, tokens(2));
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .makeOrder(token2.address, amount, token1.address, amount);
      result = await transaction.wait();
    });

    describe("Cancelling Orders", () => {
      describe("Success", () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
        });

        it("Updates cancelled orders", async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it("Emits a Cancel event", async () => {
          const event = result.events[0];
          expect(await event.event).to.equal("Cancel");

          const args = event.args;
          expect(await args._id).to.equal(1);
          expect(await args._user).to.equal(user1.address);
          expect(await args._tokenGet).to.equal(token2.address);
          expect(await args._amountGet).to.equal(tokens(1));
          expect(await args._tokenGive).to.equal(token1.address);
          expect(await args._amountGive).to.equal(tokens(1));
          expect(await args._timestamp).to.at.least(1);
        });
      });

      describe("Failure", () => {
        beforeEach(async () => {
          transaction = await token1
            .connect(user1)
            .approve(exchange.address, amount);
          result = await transaction.wait();

          transaction = await exchange
            .connect(user1)
            .depositToken(token1.address, amount);
          result = await transaction.wait();

          transaction = await exchange
            .connect(user1)
            .makeOrder(token2.address, amount, token1.address, amount);
          result = await transaction.wait();
        });

        it("Rejects invalid order ids", async () => {
          const invalidOrderId = 99999;
          await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to
            .be.reverted;
        });

        it("Rejects unauthorised cancellations", async () => {
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
        });
      });
    });

    describe("Filling Orders", () => {
      describe("Success", () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user2).fillOrder(1);
          result = await transaction.wait();
        });

        it("Execute trade and charge fees", async () => {
          expect(
            await exchange.balanceOf(token1.address, user1.address)
          ).to.equal(tokens(0));
          expect(
            await exchange.balanceOf(token1.address, user2.address)
          ).to.equal(tokens(1));
          expect(
            await exchange.balanceOf(token1.address, feeAccount.address)
          ).to.equal(tokens(0));

          expect(
            await exchange.balanceOf(token2.address, user1.address)
          ).to.equal(tokens(1));
          expect(
            await exchange.balanceOf(token2.address, user2.address)
          ).to.equal(tokens(0.9));
          expect(
            await exchange.balanceOf(token2.address, feeAccount.address)
          ).to.equal(tokens(0.1));
        });

        it("Updates filled orders", async () => {
          expect(await exchange.orderFilled(1)).to.equal(true);
        });

        it("Emits a Trade event", async () => {
          const event = result.events[0];
          expect(await event.event).to.equal("Trade");

          const args = event.args;
          expect(await args._id).to.equal(1);
          expect(await args._user).to.equal(user2.address);
          expect(await args._tokenGet).to.equal(token2.address);
          expect(await args._amountGet).to.equal(tokens(1));
          expect(await args._tokenGive).to.equal(token1.address);
          expect(await args._amountGive).to.equal(tokens(1));
          expect(await args._creator).to.equal(user1.address);
          expect(await args._timestamp).to.at.least(1);
        });
      });

      describe("Failure", () => {
        it("Rejects invalid order ids", async () => {
          const invalidOrderId = 99999;
          await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be
            .reverted;
        });

        it("Rejects filled orders", async () => {
          transaction = await exchange.connect(user2).fillOrder(1);
          result = await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
        });

        it("Rejects cancelled orders", async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
        });
      });
    });
  });
});
