/* eslint-disable react-hooks/exhaustive-deps */
import './assets/App.css';
import './assets/modalLoader.css';
import { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { AuthContext, NETWORK_RPC_URL } from './components/AuthProvider';
import NftWatcher from "./NftWatcherClass";
import eyeOfHorus from './assets/eye-of-horus-32.png';
import loader from './assets/loader.svg';

function App() {
  const [accessNFT, setAccessNFT] = useState(false);

  const authInfos = useContext(AuthContext);
  let NFTwatch = new NftWatcher();
  const youtubeVideoId = "em2iO_ko79k";
  let contractAddress = "0x6243763323F150Fc46A70d3624D29226a63f0c9F"; // Warning, case sensitive !!!

  useEffect(() => {
    const checkNFTOnChangeAddress = async () => {      
      try {
        if(authInfos.selectedAddress === undefined) return;
        console.log("[checkNFTOnChangeAddress] selectedAddress: ", authInfos.selectedAddress)
        setUserAccess();
      } catch (error) {
        console.error(error);
      }
    };
    checkNFTOnChangeAddress();
  }, [authInfos.selectedAddress]);

  async function setUserAccess() {
    console.log('setUserAccess...');
    if (await checkNFT() === 0) {
      setAccessNFT(false);
      console.log('setUserAccess to false');
      NFTwatch.stop();
      return;
    }
    setAccessNFT(true);
    console.log('setUserAccess to true');
    startWatcher();
  }

  //**** Watcher ****
  async function startWatcher() {
    NFTwatch.start(authInfos._provider, contractAddress, authInfos.selectedAddress, onTransaction);
  }

  async function onTransaction() {
    console.log('onTransaction...');
    //await sleep(5000);
    setUserAccess();
  }

  async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  //**** Buttons ****
  async function btnConnect() {
    console.log('-- btnConnect --');
    await authInfos._connectWallet();
  }

  async function btnBuy() {
    console.log('-- btnBuy --');
    // check connect
    if (!authInfos.selectedAddress && window.ethereum) {
      alert('Not connected !');
      return;
    }
    // check nft (already have one)
    if (await checkNFT() > 0) {
      if (!accessNFT) setAccessNFT(true);
      alert('You already have the NFT. Just play.');
      return;
    }
    if (accessNFT) setAccessNFT(false);
    // buy nft
    if (!await buyNFT()) return;
    //await sleep(5000);
    setUserAccess();
  }

  //**** Check NFT ****
  async function checkNFT() {
    //console.log('check NFT ...');
    try {
      const signer = authInfos._provider.getSigner();
      const contractABI = [
        {
          "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
          "name": "balanceOf",
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      const contractTicket = new ethers.Contract(contractAddress, contractABI, signer);
      const result = await contractTicket.balanceOf(authInfos.selectedAddress[0]);
      //console.log('checkNFT result: ', parseInt(result._hex));
      return parseInt(result._hex);
    }
    catch(error) {
      console.error('Error checkNFT: ', error);
    }
    return 0;
  }

  //**** Buy NFT ****
  async function buyNFT() {
    console.log('buy NFT ...');
    let price = 10 ** 14;

    if (!window.ethereum) return false;
    try {
      loaderStart("waiting transaction ...");
      const gas = await getGasPrices();
      const fastGasPrice = Math.trunc(gas * 1000000000);
      //console.log('fastGasPrice: ' + fastGasPrice);
      const signer = authInfos._provider.getSigner();
      const contractABI = [
        {
          "inputs": [],
          "name": "buy",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ];
      //console.log('price: ' + price);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const transaction = await contract.buy({ value: price.toString(), gasPrice: fastGasPrice });
      console.log('waiting transaction ...');
      console.log("transaction: ", transaction);
      const waitTransaction = await authInfos._provider.waitForTransaction(transaction.hash);
      console.log("waitTransaction: ", waitTransaction);
      const lastest = await authInfos._provider.getBlock('latest');
      console.log("latest: ", lastest.number);
      await NFTwatch.confirmTransaction(authInfos._provider,lastest.number + 1, 1);
      await sleep(5000);
      console.log("buy successfull !!");
      loaderStop();
      return true;

    } catch (error) {
      loaderStop();
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        console.log("Transaction denied by user");
        alert('Transaction denied by user. Stopped.');
        return false;
      }
      console.error('Error buy ['+ error.code + ']: ', error);
      return false;
    }
  }

  //**** get Gas Prices ****
  async function getGasPrices() {
    //console.log("getGasPrices ...");
    let networkProvider = new ethers.providers.JsonRpcProvider(NETWORK_RPC_URL);
    let gasPrices;
    try {
      gasPrices = await networkProvider.getGasPrice();
    }
    catch (error) {
      console.error('Error getGasPrices: ', error);
      gasPrices = 3000000000;
    }
    return (gasPrices * 2) / 1000000000;
  }

  //**** Loader ****
  function loaderStart(text) {
    document.getElementById('textLoader').innerHTML = text;
    document.getElementById('divLoader').style.display = "block";
  }
  
  function loaderStop() {
    document.getElementById('divLoader').style.display = "none";
  }
  
  
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <img src={eyeOfHorus} alt="eyeOfHorus.gif" style={{marginRight: "30px"}}></img>
          <span>NFT Watcher for VOD</span>
          <img src={eyeOfHorus} alt="eyeOfHorus.gif" style={{marginLeft: "30px"}}></img>
        </div>
      </header>
      <div id="App-corps" className="App-corps">

        {accessNFT ? (
          <div className="App-video">
            <iframe
              width="853"
              height="480"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              frameBorder="0"
              allowFullScreen
              title="Video youtube"
            />
          </div>
        ) : (
          <div className="App-texte">
            {!window.ethereum && <span>We were not able to detect your MetaMask wallet on your browser. Please download and install it. Once you're done, don't forget to refresh the page.</span>}
            {window.ethereum && !authInfos.selectedAddress && <span>You are not logged in.<br/>Click the button below.</span>}
            {window.ethereum && authInfos.selectedAddress && <span>You don’t have the NFT. Please buy.</span>}
          </div>
        )
        }

        <div className="App-div-Button">
          {!window.ethereum || authInfos.selectedAddress === undefined ? (
            <button className="App-button" onClick={() => btnConnect()}>Connect</button>
          ) : (
            <>
            {!accessNFT && <button className="App-button" onClick={() => btnBuy()}>Buy</button>}
            </>
          )}
        </div>

        <div id="divLoader" className="modal-loader-overlay" style={{display: "none"}}>
          <div className="modal-wrapper">
            <div className="modal-loader">
              <div className="App"><img src={loader} alt="loader.gif" className="img_loader"></img></div>
              <div className="App" style={{paddingBottom: "5px"}}><span id="textLoader">textLoader</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
