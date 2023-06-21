import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MintNFT Test", function () {
  async function deployAuctionFixture() {
    
    const [owner, otherAccount] = await ethers.getSigners();

    const nftMintFactory = await ethers.getContractFactory("MintNFT");
    const nftMintToken = await nftMintFactory.deploy(5);

    return { nftMintToken, owner, otherAccount };
  }

  describe("Minting NFT process", function () {
    it("Verify NFT Owner's address", async function () {
      const { nftMintToken, owner } = await loadFixture(deployAuctionFixture);

      expect(await nftMintToken.mintNFT(owner.address));
    });

    it("Other account address should not be accepted", async function () {
      const { nftMintToken, otherAccount } = await loadFixture(deployAuctionFixture);

      return expect(nftMintToken.connect(otherAccount).mintNFT(otherAccount.address)).eventually.to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner");
    });

    it("Successfully Mint and deploy auction", async function () {
      const { nftMintToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);

      expect(nftMintToken.mintNFT(owner.address));

      const nftDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction");
      const nftDutchAuctionToken = await nftDutchAuctionFactory.deploy(nftMintToken.getAddress(), 0, 1000, 10, 5);

    describe("After minting - approve contract", function () {
      it("Seller should not be allowed to place a bid", async function () {
           expect(nftDutchAuctionToken.connect(owner).bid({value:200})).to.be.revertedWith('Sellers are not allowed to buy');
      });

      it("Bid cannot be placed without approval", async function () {
         expect(nftDutchAuctionToken.connect(otherAccount).bid({value:200})).to.be.revertedWith('ERC721: caller is not token owner or approved');
    });

    it("Invalid NFT token id should not be approved", async function(){
        return expect(nftMintToken.approve(nftDutchAuctionToken.getAddress(), 9)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it("Unauthorized approval should not be allowed", async function () {
        return expect(nftMintToken.connect(otherAccount).approve(nftDutchAuctionToken.getAddress(),0)).to.be.revertedWith('ERC721: approve caller is not token owner or approved for all');
    });

    it("Approving with authorized owner access", async function () {
        const approvalResult = await nftMintToken.approve(nftDutchAuctionToken.getAddress(), 0);
        expect( nftMintToken.approve(nftDutchAuctionToken.getAddress(),1));
        
        describe("Bid after contract approval", function () {

            it('Insufficient amount should not be accepted', async () => {
                expect(nftDutchAuctionToken.connect(otherAccount).bid({value:2})).to.be.revertedWith('Insufficient Amount');
              });

            it('Conclude the auction after winner is chosen', async () => {
                expect(nftDutchAuctionToken.connect(otherAccount).bid({from: otherAccount.address, value: 1200 }));
                expect(nftDutchAuctionToken.connect(otherAccount).bid({from: otherAccount.address, value: 1200 })).to.be.revertedWith('Auction Concluded');
              });
        });
        
    });
});

});

});
});