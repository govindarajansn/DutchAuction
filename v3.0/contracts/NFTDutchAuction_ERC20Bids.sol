//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface MintNFTokens{
     function safeTransferFrom(address from, address to, uint256 tokenId) external;
     function ownerOf(uint256 tokenId) external view returns(address owner);
}

interface MintERC20Tokens{
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract NFTDutchAuction_ERC20Bids {

    address payable immutable seller;
    address public currentOwner;
    address public buyer = address(0x0);

    uint256 immutable reservePrice;
    uint256 numBlockAuctionOpen;
    uint256 immutable offerPriceDecrement;
    uint256 immutable initialPrice;
    uint256 curPrice;

    uint256 immutable initialBlock;
    uint256 endBlock;

    uint256 immutable nfTokenId;
    address immutable tokenAddress;
    address immutable erc20TokenAddress;
    MintNFTokens mint;
    MintERC20Tokens mintERC20;

    constructor( address _erc20TokenAddress, address _erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        tokenAddress = _erc721TokenAddress;
        erc20TokenAddress = _erc20TokenAddress;
        nfTokenId = _nftTokenId;
        mint = MintNFTokens(tokenAddress);
        mintERC20 = MintERC20Tokens(erc20TokenAddress);
        reservePrice = _reservePrice;
        numBlockAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        seller = payable(msg.sender);
        currentOwner = seller;
        initialPrice = _reservePrice + (_numBlocksAuctionOpen * _offerPriceDecrement);
        initialBlock = block.number;
        endBlock = block.number + numBlockAuctionOpen;
    }

    function currentPrice() public view returns(uint256){
        return initialPrice - ((block.number - initialBlock) * offerPriceDecrement);
    }

    function bid(uint256 bidAmount) public payable returns(address) {
        require(buyer == address(0x0), "Auction Concluded");
        require(msg.sender != seller, "Sellers are not allowed to buy");

        curPrice = currentPrice();

        require(mintERC20.balanceOf(msg.sender) >= bidAmount, "Insufficient ERC20 Tokens in your account");
        require(bidAmount >= curPrice, "Insufficient Amount");

        buyer = payable(msg.sender);

        mint.safeTransferFrom(seller, buyer, nfTokenId);
        mintERC20.transferFrom(buyer, seller, bidAmount);

        currentOwner = buyer;
        return currentOwner;
    }

}