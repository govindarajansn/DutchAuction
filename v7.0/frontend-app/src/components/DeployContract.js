import React from 'react';
import './style.css';

function DeployContract({ deployAuctionContract, ERC721Parameters, contractAddress, setContractParameters }) {
    const contractValueHandler = (e) => {
        setContractParameters({
            ...ERC721Parameters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
            <label for="Reserve Price" ><b>Reserve Price:</b></label>
            <input type="number" value={ERC721Parameters.reservePrice} name="reservePrice" onChange={contractValueHandler} />

            <p>
                <label for='Block count'><b>Number of blocks auction is open:</b></label>
                <input type='number' value={ERC721Parameters.numBlocksAuctionOpen} name="numBlocksAuctionOpen" onChange={contractValueHandler} />
            </p>

            <p>
                <label for='Price Decrement'><b>Offer Price Decrement:</b></label>
                <input type='number' value={ERC721Parameters.offerPriceDecrement} name="offerPriceDecrement" onChange={contractValueHandler} />
            </p>

            <button onClick={deployAuctionContract} className="style-button">Deploy your Contract</button>
            <p><b>Address of the deployed contract:</b> {contractAddress}</p>
        </div>
    );
}

export default DeployContract;
