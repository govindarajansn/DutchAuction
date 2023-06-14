import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('BasicDutchAuction', () => {
  let auctionContract;
  let seller;
  let bidder1;
  let bidder2;

  beforeEach(async () => {
    const AuctionContract = await ethers.getContractFactory('BasicDutchAuction');
    [seller, bidder1, bidder2] = await ethers.getSigners();

    const reservePrice = ethers.parseEther('1');
    const numBlockAuctionOpen = 10;
    const offerPriceDecrement = ethers.parseEther('0.1');

    auctionContract = await AuctionContract.deploy(reservePrice, numBlockAuctionOpen, offerPriceDecrement);

    return {auctionContract, reservePrice, numBlockAuctionOpen, offerPriceDecrement, seller, bidder1, bidder2};
  });

  it('Seller should not be allowed to place a bid', async () => {
    const bidAmount = ethers.parseEther('2.5');

    await expect(auctionContract.connect(seller).bid({ value: bidAmount })).to.be.revertedWith('Sellers are not allowed to buy');
  });

  it('Insufficient amount should not be accepted', async () => {
    const bidAmount = ethers.parseEther('1.5');

    await expect(auctionContract.connect(bidder1).bid({ value: bidAmount })).to.be.revertedWith('Insufficient Amount');
  });

  it('Choose the winner based on the conditions', async () => {
    const bidAmount = ethers.parseEther('2.5');

    await auctionContract.connect(bidder1).bid({ value: bidAmount });
    const winner = await auctionContract.winner();

    expect(winner).to.equal(bidder1.address);
  });

  it('Conclude the auction after winner is chosen', async () => {
    const amount1 = ethers.parseEther('2.5');
    const amount2 = ethers.parseEther('2.5');

    await auctionContract.connect(bidder1).bid({ value: amount1 });
    await expect (auctionContract.connect(bidder2).bid({ value: amount2 })).to.be.revertedWith('Auction Concluded');
  });

  it('Transfer the bid amount to the seller when auction is over', async () => {
    const bidAmount = ethers.parseEther('2.5');
    const initialSellerBalance = await ethers.provider.getBalance(seller.address);

    await auctionContract.connect(bidder1).bid({ value: bidAmount });
    const newSellerBalance = await ethers.provider.getBalance(seller.address);

    const expectedBalance = initialSellerBalance + bidAmount;
    expect(newSellerBalance).to.equal(expectedBalance);
  });
});
