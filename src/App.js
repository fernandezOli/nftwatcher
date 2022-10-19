import './assets/App.css';
import { useContext } from 'react';
import { ethers } from 'ethers';
import YouTube from 'react-youtube';

import { AuthContext } from './components/AuthProvider';

function App() {
  const authInfos = useContext(AuthContext);
  //const youtubeVideoId = "-tJYN-eG1zk";
  let contractAddress = "0x4Da5b018ea6C11280a1739719aE753eB39001d11";

  const opts = {
    //height: '390',
    //width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1
    }
  };

  function btnConnect() {
    console.log('-- btnConnect --');
    authInfos._connectWallet();
  }

  async function btnPlay() {
    console.log('-- btnPlay --');
    // check connect
    if (!authInfos.selectedAddress && window.ethereum) {
      alert('Not connected !');
      return;
    }
    // check nft
    if (await checkNFT() === 0) {
      alert('You have not the NFT. Please buy it.');
    }
    // run watcher
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
      alert('You already have the NFT. Just play.');
    }
    // buy nft
  }

  async function checkNFT() {
    console.log('check NFT ...');
    console.log('check NFT contractAddress: ',contractAddress);
    console.log('check NFT user Address: ',authInfos.selectedAddress);
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
      console.log('checkNFT result: ', parseInt(result._hex));
      return parseInt(result._hex);
    }
    catch(error) {
      console.error('Error checkNFT: ', error);
    }
    return 0;
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <p>
          NFT Watcher for VOD
        </p>
      </header>
      <div id="App-corps" className="App-corps">

        <div className="App-video">
        {/*authInfos.selectedAddress !== undefined ? (<YouTube videoId={youtubeVideoId} opts={opts} />) : <span>pas youtube</span>*/}
        <YouTube videoId="-tJYN-eG1zk" containerClassName="embed embed-youtube" opts={opts} />
        {/*<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>*/}
        </div>

        <div className="App-div-Button">
          {authInfos.selectedAddress === undefined ? (
            <button className="App-button" onClick={() => btnConnect()}>Connect</button>
          ) : (
            <>
            <button className="App-button" style={{marginRight: "20px"}} onClick={() => btnPlay()}>Play</button>
            <button className="App-button" onClick={() => btnBuy()}>Buy</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
