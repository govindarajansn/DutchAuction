import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import "@openzeppelin/hardhat-upgrades";
import { ethers, upgrades } from "hardhat";

describe("MintNFT Test", function () {
    async function deployAuctionFixture() {

        const [owner, otherAccount] = await ethers.getSigners();

        const nftMintFactory = await ethers.getContractFactory("MintNFT");
        const nftMintToken = await nftMintFactory.deploy(5);

        const ERC20MintFactory = await ethers.getContractFactory("ERC20Token");
        const ERC20MintToken = await ERC20MintFactory.deploy(500);

        return { ERC20MintToken, nftMintToken, owner, otherAccount };
    }

    it("Verify total ERC20 supply", async function () {
        const { ERC20MintToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);
        const totalERC20Supply = await ERC20MintToken.getTotalERC20Supply();

        describe("Tests for ERC721 and ERC20", function () {

            it("ERC20 minting by Owner", async function () {
                expect(await ERC20MintToken.mintERC20(owner.address, 300));
            });

            it("ERC20 minting by other account", async function () {
                expect(await ERC20MintToken.mintERC20(otherAccount.address, 200));
            });

            it("Total supply reached for ERC20 Token", async function () {
                await expect(ERC20MintToken.mintERC20(otherAccount.address, 100)).to.be.revertedWith('Maximum amount of ERC20 minting has exceeded');
            });


            describe("Successfully Mint and deploy auction", function () {
                it("Verify NFT Owner's address", async function () {
                    const { nftMintToken, owner } = await loadFixture(deployAuctionFixture);

                    expect(nftMintToken.mintNFT(owner.address));
                });

                it("Other account address should not be accepted", async function () {
                    const { nftMintToken, otherAccount } = await loadFixture(deployAuctionFixture);

                    return expect(nftMintToken.connect(otherAccount).mintNFT(otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
                });

                it("Deploy auction", async function () {
                    const { ERC20MintToken, nftMintToken, owner, otherAccount } = await loadFixture(deployAuctionFixture);
                    expect(nftMintToken.mintNFT(owner.address));

                    const nftDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction_ERC20Bids");
                    const nftDutchAuctionToken = await upgrades.deployProxy(nftDutchAuctionFactory, [ERC20MintToken.address, nftMintToken.address, 0, 100, 20, 5],
                        {
                            kind: "uups",
                            initializer: "initialize( address, address, uint256, uint256, uint256, uint256)",
                            timeout: 0
                        });

                    describe("After minting - before approving contract", function () {
                        it("Sufficient ERC20 tokens must available", async function () {
                            await expect(nftDutchAuctionToken.connect(otherAccount).bid(400)).to.be.revertedWith('Insufficient ERC20 Tokens in your account');
                        })

                        describe("Approving ERC20 contract", async function () {
                            await ERC20MintToken.connect(otherAccount).approve(nftDutchAuctionToken.address, 400);

                            describe("After approving contract", function () {

                                it("Seller should not be allowed to place a bid", async function () {
                                    ERC20MintToken.mintERC20(otherAccount.address, 400);
                                    await expect(nftDutchAuctionToken.connect(owner).bid(400)).to.be.revertedWith('Sellers are not allowed to buy');
                                })

                                it("Bid cannot be placed without ERC721 approval", async function () {
                                    ERC20MintToken.mintERC20(otherAccount.address, 400);
                                    ERC20MintToken.connect(otherAccount).approve(nftDutchAuctionToken.address, 400)
                                    await expect(nftDutchAuctionToken.connect(otherAccount).bid(400)).to.be.revertedWith('ERC721: caller is not token owner or approved');
                                })

                                it("Invalid NFT token id should not be approved", async function () {
                                    return expect(nftMintToken.approve(nftDutchAuctionToken.address, 9)).to.be.revertedWith('ERC721: invalid token ID');
                                });

                                it("Unauthorized approval should not be allowed", async function () {
                                    return expect(nftMintToken.connect(otherAccount).approve(nftDutchAuctionToken.address, 0)).to.be.revertedWith('ERC721: approve caller is not token owner or approved for all');
                                });
                                it("Approving with authorized owner access", async function () {
                                    const approvalResult = await nftMintToken.approve(nftDutchAuctionToken.address, 0);
                                    expect(nftMintToken.approve(nftDutchAuctionToken.address, 1));

                                    describe("Bid after contract approval", function () {
                                        it("Insufficient amount should not be accepted", async function () {
                                            await expect(nftDutchAuctionToken.connect(otherAccount).bid(50)).to.be.revertedWith('Insufficient Amount');
                                        });

                                        it("Place a successful bid", async function () {
                                            await expect(nftDutchAuctionToken.connect(otherAccount).bid(400));
                                        });

                                        it("Verify Owner account gets ERC20 token", async function () {
                                            expect(await ERC20MintToken.balanceOf(owner.address)).to.equal(400);
                                        });

                                        it("Conclude the auction after winner is chosen", async function () {
                                            await expect(nftDutchAuctionToken.connect(otherAccount).bid(110)).to.be.revertedWith('Auction Concluded');
                                        });
                                    });

                                });


                            })
                        });


                    })
                })
            })
        });

    });
});