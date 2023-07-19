import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import abi from './utils/DutchAuctionParameters.json';
import ConnectWallet from './components/ConnetWallet';
import DeployContract from './components/DeployContract';
import AuctionDetails from './components/AuctionDetails';
import BidAuction from './components/BidAuction';

function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const contractAbi = abi.abi;
  const contractByteCode = abi.bytecode;
  const [contractAddress, setContractAddress] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [ERC721Parameters, setContractParameters] = useState({
    reservePrice: "",
    numBlocksAuctionOpen: "",
    offerPriceDecrement: ""
  })
  const [contractShowUpDetails, setContractShowUpDetails] = useState({
    winner: "",
    currentPriceVal: "",
    reservePriceVal: "",
    numBlocksAuctionOpenVal: "",
    offerPriceDecrementVal: "",
    auctionStatus: ""
  })

  const [bidAmount, setBidAmount] = useState({
    "bidValue": "",
    "contractAddr": ""
  });

  const [contractDisplay, setContractDisplay] = useState({
    "contractAddrDisplay": ""
  })

  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(result => {
          if (result.length != 0) {
            setWalletAddress([result[0]]);
            getCurrentBalance(result[0]);
            console.log(walletAddress);
          }
          else
            console.error("No authorized account found");
        })
    } else {
      setErrorMessage('Please install MetaMask');
    }
  }
  const getCurrentBalance = (accountAddress) => {
    window.ethereum.request({ method: 'eth_getBalance', params: [String(accountAddress), "latest"] })
      .then(balance => {
        setUserBalance(ethers.utils.formatEther(balance));
      })
  }

  const deployAuctionContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log("Hello")
    console.log(setContractParameters);
    console.log(signer);
    const dutchAuctionContractFactory = new ethers.ContractFactory(contractAbi, contractByteCode, signer);
    console.log(dutchAuctionContractFactory)
    console.log(ERC721Parameters.reservePrice);
    const dutchAuctionContract = await dutchAuctionContractFactory.deploy(ERC721Parameters.reservePrice, ERC721Parameters.numBlocksAuctionOpen, ERC721Parameters.offerPriceDecrement);
    setContractAddress(dutchAuctionContract.address);
    let currPrc = await dutchAuctionContract.currentPrice();
    console.log(contractAddress)
    console.log(parseInt(currPrc, 10));
  }

  const changeAddressDetails = (e) => {
    setContractDisplay({
      ...contractDisplay,
      [e.target.name]: e.target.value
    });
  }

  const showContractDetails = async (e) => {
    e.preventDefault();
    try {
      console.log(contractDisplay)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
      const contractDetails = new ethers.Contract(contractDisplay.contractAddrDisplay, contractAbi, signer);
      console.log(contractDetails)
      var winner = await contractDetails.buyer();
      var auctionStatus = "Closed";
      console.log(winner);
      const currentAuctionPrice = await contractDetails.currentPrice();
      console.log(parseInt(currentAuctionPrice, 10));
      var reservePricetemp = await contractDetails.reservePrice();
      var offerPriceDecrementtemp = await contractDetails.offerPriceDecrement();
      var numBlocksAuctionOpentemp = await contractDetails.numBlockAuctionOpen();
      console.log(parseInt(reservePricetemp, 10));

      if (winner == "0x0000000000000000000000000000000000000000") {
        winner = "No winner declared";
        auctionStatus = "Open";
      }

      setContractShowUpDetails({
        winner: winner,
        currentPriceVal: parseInt(currentAuctionPrice, 10),
        reservePriceVal: parseInt(reservePricetemp, 10),
        numBlocksAuctionOpenVal: parseInt(numBlocksAuctionOpentemp, 10),
        offerPriceDecrementVal: parseInt(offerPriceDecrementtemp, 10),
        auctionStatus: auctionStatus
      })
    } catch (error) {
      window.alert(error.reason)
    }
  }

  console.log(contractShowUpDetails.currentPriceVal);
  console.log(contractShowUpDetails.reservePriceVal);
  console.log(contractShowUpDetails.numBlocksAuctionOpenVal);
  console.log(contractShowUpDetails.offerPriceDecrementVal);

  const bidFunction = async (e) => {
    try {
      console.log(bidAmount)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
      const auctionContract = new ethers.Contract(bidAmount.contractAddr, contractAbi, signer);
      console.log(auctionContract)
      const transaction = await auctionContract.bid({ value: bidAmount.bidValue });
      window.alert("Bid Successfully Placed, winner will be announced soon");
    } catch (error) {
      window.alert(error.reason)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3 className='header-3'>Connect Wallet</h3>
        <ConnectWallet
          connectWallet={connectWallet}
          walletAddress={walletAddress}
          userBalance={userBalance}
          errorMessage={errorMessage}
        />

        <h3 className='header-3'>Deploy Contract</h3>
        <DeployContract
          deployAuctionContract={deployAuctionContract}
          ERC721Parameters={ERC721Parameters}
          contractAddress={contractAddress}
          setContractParameters={setContractParameters}
        />

        <h3 className='header-3'>Auction Details</h3>
        <AuctionDetails
          contractDisplay={contractDisplay}
          changeAddressDetails={changeAddressDetails}
          showContractDetails={showContractDetails}
          contractShowUpDetails={contractShowUpDetails}
        />
        <h3 className='header-3'>Place a Bid</h3>
        <BidAuction
          bidFunction={bidFunction}
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
        />
      </header>
    </div>
  );
}

export default App;
