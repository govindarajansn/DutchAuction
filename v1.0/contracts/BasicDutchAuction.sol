//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract BasicDutchAuction {

    address payable public seller;
    address public buyer = address(0x0);
    address public winner = address(0x0);

    uint256 immutable reservePrice;
    uint256 numBlockAuctionOpen;
    uint256 immutable offerPriceDecrement;
    uint256 immutable initialPrice;
    
    mapping(address => uint256) public bids;

    constructor(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        reservePrice = _reservePrice;
        numBlockAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        seller = payable(msg.sender);
        initialPrice = _reservePrice + (_numBlocksAuctionOpen * _offerPriceDecrement);
    }

    function bid() public payable returns(address) {
        require(msg.sender != seller, "Sellers are not allowed to buy");

        buyer = msg.sender;
        bids[buyer] = msg.value;
        require(msg.value >= initialPrice, "Insufficient Amount");
        require(winner == address(0x0), "Auction Concluded");
        
        winner = msg.sender;
        seller.transfer(msg.value);

        return winner;
    }
}
