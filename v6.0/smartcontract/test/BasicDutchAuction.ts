import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BasicDutchAuction", function () {
  async function deployAuctionFixture() {
    
    const [owner, otherAccount] = await ethers.getSigners();

    const basicDutchAuctionFactory = await ethers.getContractFactory("BasicDutchAuction");
    const basicDutchAuctionToken = await basicDutchAuctionFactory.deploy(100, 10, 10);
    // await basicDutchAuctionToken.deployed();
    // console.log("Contract deployed to:", basicDutchAuctionToken.address);

    return { basicDutchAuctionToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Get the initial price", async function () {
      const { basicDutchAuctionToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);

      expect(await basicDutchAuctionToken.currentPrice()).to.equal(200);
    });

    it("Bid from the account which created the contract", async function () {
      const { basicDutchAuctionToken, owner } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(owner.address).bid({value:200})).to.be.revertedWith('Sellers are not allowed to buy');
    });

    it("Bid from buyer account - Equal to the current price", async function () {
      const { basicDutchAuctionToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 }));
    });

    // it("Bid from buyer account - Greater than the current price", async function () {
    //   const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);

    //   expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 400 }));
    // });

    it("Bid from buyer account - Less than the price", async function () {
      const { basicDutchAuctionToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 20 })).to.be.revertedWith('Insufficient Value');
    });
  });

  describe("Auction Conclusion", function () {
    it("Auction Concluded - bid from another buyer", async function () {
      const { basicDutchAuctionToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);

      basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 });
      expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 })).to.be.revertedWith('Auction Concluded');
    });

    it("Auction Closed", async function () {
        const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);
        basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 });
        
        expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 })).to.be.revertedWith('Auction Concluded');
        });
        
        it("Auction Closed", async function () {
        const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);
        
        await time.increase(time.duration.hours(20));
        expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 })).to.be.revertedWith('Auction Closed');
        });
        
        
        it("Bid from buyer account - After the auction is closed", async function () {
        const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);
        
        await time.increase(time.duration.days(10));
        
        expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 400 })).to.be.revertedWith('Auction Closed');
        });
        
        it("Bid from buyer account - After the auction has been concluded", async function () {
        const { basicDutchAuctionToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);
        
        basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 400 });
        
        expect(basicDutchAuctionToken.connect(owner.address).bid({from: owner.address, value: 400 })).to.be.revertedWith('Auction Concluded');
        });
        
        
        it("Auction Concluded - Bid from buyer after auction is concluded", async function () {
        const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);
        
          // Move time forward to end the auction
          await time.increase(time.duration.hours(10));
        
          expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 })).to.be.revertedWith('Auction Concluded');
        });
        
        it("Auction Closed - Bid from buyer after auction is closed", async function () {
          const { basicDutchAuctionToken, otherAccount } = await loadFixture(deployAuctionFixture);
          
          // Move time forward to end the auction
          await time.increase(time.duration.hours(20));
        
          expect(basicDutchAuctionToken.connect(otherAccount.address).bid({from: otherAccount.address, value: 200 })).to.be.revertedWith('Auction Closed');
        });
        });
  });