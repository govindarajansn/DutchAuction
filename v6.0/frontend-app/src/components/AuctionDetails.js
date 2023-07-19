import React from 'react';
import './style.css';

function AuctionDetails({ contractDisplay, changeAddressDetails, showContractDetails, contractShowUpDetails }) {
    return (
        <div>
            <div>
                <label for="Contract Address"><b>Contract Address:</b></label>
                <input name="contractAddrDisplay" value={contractDisplay.contractAddrDisplay} onChange={changeAddressDetails} />
            </div>

            <div>
                <button onClick={showContractDetails} className="style-button">Show Details</button>
            </div>

            <div style={{ overflow: "hidden", width: "auto" }}>
                <p><b>Winner:</b> {contractShowUpDetails.winner}</p>
                <p><b>Reserve Price:</b> {contractShowUpDetails.reservePriceVal}</p>
                <p><b>Number of blocks auction is open:</b> {contractShowUpDetails.numBlocksAuctionOpenVal}</p>
                <p><b>Offer Price Decrement:</b> {contractShowUpDetails.offerPriceDecrementVal}</p>
                <p><b>Current Price:</b> {contractShowUpDetails.currentPriceVal}</p>
                <p><b>Auction Status:</b> {contractShowUpDetails.auctionStatus}</p>
            </div>
        </div>
    );
}

export default AuctionDetails;
