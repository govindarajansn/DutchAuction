import React from "react";
import './style.css';

function BidAuction({ bidFunction, bidAmount, setBidAmount }) {
    const changeBidAmt = (e) => {
        setBidAmount({
            ...bidAmount,
            [e.target.name]: e.target.value
        });
        console.log(bidAmount)
    };
    return (
        <>
            <div>
                <label for="Contract Address" > <b>Contract Address:</b> </label> <input name="contractAddr" value={bidAmount.contractAddr} onChange={changeBidAmt} />
                <p><label for="Bid Amount" > <b>Bid Amount:</b> </label> <input name="bidValue" value={bidAmount.bidValue} onChange={changeBidAmt} /></p>
                <div>
                    <button onClick={bidFunction} className="style-button">Place a Bid</button>
                </div><br />
            </div>
        </>
    )
}

export default BidAuction;