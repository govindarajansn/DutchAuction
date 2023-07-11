import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import "@openzeppelin/hardhat-upgrades";
import { ethers, upgrades } from "hardhat";
import { BigNumber, BigNumberish, constants, Signature, Wallet } from "ethers";
import { ERC20Token, ERC20Token__factory } from '../typechain-types';
import { splitSignature } from "ethers/lib/utils";
import { token } from "../typechain-types/@openzeppelin/contracts";


async function getPermitSignature(signer: any, token: ERC20Token, spender: string, value: any, deadline: BigNumber) {
    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(signer.address),
        token.name(),
        "1",
        signer.getChainId(),
    ])

    console.log(token.address)
    return ethers.utils.splitSignature(
        await signer._signTypedData(
            {
                name,
                version,
                chainId,
                verifyingContract: token.address,
            },
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline
            }
        )
    )
}


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
                    await nftDutchAuctionToken.deployed();

                    describe("After minting - before approving contract", function () {
                        it("Sufficient ERC20 tokens must available", async function () {
                            await expect(nftDutchAuctionToken.connect(otherAccount).bid(400)).to.be.revertedWith('Insufficient ERC20 Tokens in your account');
                        })

                        it("Reject ERC20 Permit Signature due to invalid signature", async function () {
                            const amount = 1000;
                            const deadline = constants.MaxUint256;
                            console.log(ERC20MintToken.address)
                            const { v, r, s } = await getPermitSignature(
                                owner,
                                ERC20MintToken,
                                nftDutchAuctionToken.address,
                                amount,
                                deadline
                            )
                            await expect(ERC20MintToken.permit(owner.address, nftDutchAuctionToken.address, 200, deadline, v, r, s)).to.be.revertedWith("ERC20Permit: invalid signature");
                        });

                        it("Approving ERC20", async function () {
                            const amount = 800;
                            const deadline = constants.MaxUint256;

                            console.log(ERC20MintToken.address)

                            const { v, r, s } = await getPermitSignature(
                                owner,
                                ERC20MintToken,
                                nftDutchAuctionToken.address,
                                amount,
                                deadline
                            )
                            await ERC20MintToken.permit(owner.address, nftDutchAuctionToken.address, amount, deadline, v, r, s);

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

                        })
                    })
                })
            })
        });

    });
});