//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface MintNFTokens{
     function safeTransferFrom(address from, address to, uint256 tokenId) external;
     function ownerOf(uint256 tokenId) external view returns(address owner);
}

contract NFTDutchAuction {

    address payable public seller;
    address public currentOwner;
    address public buyer = address(0x0);
    address public winner = address(0x0);

    uint256 immutable reservePrice;
    uint256 numBlockAuctionOpen;
    uint256 immutable offerPriceDecrement;
    uint256 immutable initialPrice;
    uint256 curPrice;
    
    uint256 immutable initialBlock;
    uint256 endBlock;

    uint256 immutable nfTokenId;
    address immutable tokenAddress;
    MintNFTokens mint;

    mapping(address => uint256) public bids;

    constructor(address _tokenAddress, uint256 _nfTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        tokenAddress = _tokenAddress;
        nfTokenId = _nfTokenId;
        mint = MintNFTokens(tokenAddress);
        reservePrice = _reservePrice;
        numBlockAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        seller = payable(msg.sender);
        currentOwner = seller;
        initialPrice = _reservePrice + (_numBlocksAuctionOpen * _offerPriceDecrement);
        initialBlock = block.number;
        endBlock = block.number + numBlockAuctionOpen;
        curPrice = initialPrice - ((block.number - initialBlock) * offerPriceDecrement);

    }

    function bid() public payable returns(address) {
        require(msg.sender != seller, "Sellers are not allowed to buy");

        buyer = msg.sender;
        bids[buyer] = msg.value;
        require(msg.value >= curPrice, "Insufficient Amount");
        require(winner == address(0x0), "Auction Concluded");

        winner = msg.sender;
        mint.safeTransferFrom(seller, winner, nfTokenId);

        seller.transfer(msg.value);

        currentOwner = winner;
        return currentOwner;
    }

}