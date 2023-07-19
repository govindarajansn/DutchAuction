import React from 'react';
import './style.css';

function ConnectWallet({ connectWallet, walletAddress, userBalance, errorMessage }) {
    return (
        <div>

            <p><b>Account Address:</b> {walletAddress}</p>
            <p><b>Account Balance:</b> {userBalance} ETH</p>
            <button onClick={connectWallet} className="style-button">Connect Wallet</button>
            {errorMessage && errorMessage}
        </div>
    );
}

export default ConnectWallet;
