/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from 'ethers';
import React, { createContext, useState } from 'react';

//import { ConnectWallet } from './ConnectWallet';
//import { NoWalletDetected } from '../pages/NoWalletDetected';
import { networkList } from '../networks';

export const AuthContext = createContext();

export let NETWORK_ID_STR = '5';
export let NETWORK_ID_INT = 5;
export let NETWORK_NAME = 'Goerli';


const AuthProvider = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [networkError, setNetworkError] = useState(undefined);
  const [registered, setRegistered] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [networkName, setNetworkName] = useState(NETWORK_NAME);
  const [networkID, setNetworkID] = useState(NETWORK_ID_INT);
  const [networkData, setNetworkData] = useState(networkList.networks[0][NETWORK_ID_INT]);

  if (!window.ethereum) {
    /*return <NoWalletDetected />;*/
    // TODO : ajout phrase si pas wallet ?
    //return <ConnectWallet networkName={NETWORK_NAME} networkId={NETWORK_ID_STR} />;
  }

  const _provider = new ethers.providers.Web3Provider(window.ethereum);

  const _setNetwork = () => {
      if (networkData === networkList.networks[0][NETWORK_ID_INT]) return;
      setNetworkData(networkList.networks[0][NETWORK_ID_INT]);
      console.log('networkData', networkData);
      //console.log('networkData.chainId:', networkData.chainId);
  }

  const _checkNetwork = () => {
    if (window.ethereum.networkVersion === NETWORK_ID_STR) {
      if (networkName !== NETWORK_NAME) setNetworkName(NETWORK_NAME);
      if (networkID !== NETWORK_ID_INT) setNetworkID(NETWORK_ID_INT);
      return true;
    }
    setNetworkError('Switch network, please :)');
    return false;
  };

  const _checkUserConnection = () => {
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const _initialize = (userAddress) => {
    if (userAddress === selectedAddress) return;
    setSelectedAddress(userAddress);
    _provider.getBalance(`${userAddress}`).then((res) => {
      setBalance(parseInt(ethers.utils.formatEther(res._hex)));
    });
  };

  const _autoConnectWallet = async () => {
    _setNetwork();
    const hexString = '0x' + networkData.chainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexString }],
      });
    } catch (e) {
      if (e.code === 4902) {
        alert('Unknow network, please add it before retry.');
        return;
      }
      console.error('Error while connecting', e);
    }
    window.location.reload();
  }
  /*
  const _addChainToWallet = async () => {
    _setNetwork();
    const hexString = '0x' + networkData.chainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{  chainId: hexString, //'0x7'
                    chainName: networkData.networkName, //'ThaiChain Mainnet',
                    nativeCurrency: { name: networkData.currencyName, symbol: networkData.symbol , decimals: 18},
                    rpcUrls: [networkData.RPC_URL], //['https://rpc.dome.cloud'],
                    blockExplorerUrls: [networkData.scanlink]}], //['https://exp.tch.in.th/home']}],
      });
    } catch (e) {
      console.error('Error while connecting', e);
    }
    //window.location.reload();
  }
  */
  const _connectWallet = async () => {
    if (!_checkNetwork()) {
      return;
    }
    const userAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (userAddress === selectedAddress) {
      return;
    }
    _initialize(userAddress);
    _setNetwork();

    // init events
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      //_stopPollingData();
      console.log('accountsChanged !');
      if (newAddress === undefined) {
        return _resetState();
      }
      _initialize(newAddress);
    });

    window.ethereum.on('chainChanged', ([networkId]) => {
      //_stopPollingData();
      console.log('chainChanged !');
      //_setNetwork();
      _resetState();
    });
  };

  const _dismissNetworkError = () => {
    setNetworkError(undefined);
  };

  const _resetState = () => {
    setSelectedAddress(undefined);
    setNetworkError(undefined);
    setRegistered(undefined);
  };

  if (!selectedAddress && window.ethereum) {
    _connectWallet();
  }

  /*
  if (!selectedAddress) {
    return <ConnectWallet
    connectWallet={() => _connectWallet()}
    autoConnectWallet={() => _autoConnectWallet()}
    addChainToWallet={() => _addChainToWallet()}
    networkName={NETWORK_NAME}
    networkId={NETWORK_ID_STR}
    networkError={networkError}
    dismiss={() => _dismissNetworkError()}
    />
  }
  */

  return (
    <AuthContext.Provider value={{ selectedAddress, _connectWallet, _autoConnectWallet, networkError, _dismissNetworkError, registered, balance, _checkUserConnection, networkName, networkID, _provider }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
