/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from 'ethers';
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export let NETWORK_ID_STR = '1313161555';
export let NETWORK_ID_INT = 1313161555;
export let NETWORK_ID_HEX = '0x4E454153';
export let NETWORK_NAME = 'Aurora Testnet';
export let NETWORK_RPC_URL = "https://testnet.aurora.dev/";

const AuthProvider = ({ children }) => {
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  if (!window.ethereum) {
    return;
  }

  const _provider = new ethers.providers.Web3Provider(window.ethereum);

  const _checkNetwork = async() => {
    if (window.ethereum.networkVersion === NETWORK_ID_STR) {
      return true;
    }
    //setNetworkError('Switch network, please :)');
    //await _switchNetwork(NETWORK_ID_HEX);
    return false;
  };

  const _checkUserConnection = () => {
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const _initialize = (userAddress) => {
    try {
      if (userAddress === selectedAddress) return;
      setSelectedAddress(userAddress);
      _provider.getBalance(`${userAddress}`).then((res) => {
        setBalance(parseInt(ethers.utils.formatEther(res._hex)));
      });
    } catch (e) {
      console.error('Error while initializing', e);
    }
  };

  const _connectWallet = async () => {
    console.log('connect Wallet ...')
    if (!await _checkNetwork()) {
      return;
    }
    const userAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
    _initialize(userAddress);
      //_checkNetwork()

    // init events
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      console.log('accountsChanged !');
      if (newAddress === undefined) {
        return _resetState();
      }
      _initialize(newAddress);
    });

    window.ethereum.on('chainChanged', ([networkId]) => {
      console.log('chainChanged: ',networkId);
      //_checkNetwork()
      //window.location.reload();
    });
  };

  const _resetState = () => {
    setSelectedAddress(undefined);
  };

  const _switchNetwork = async(hexNetworkId) => {
    console.log('Switch Network ...');
    if (!window.ethereum) {
      console.log("Install Metamask");
      return;
    }
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexNetworkId }] });
      _connectWallet();
    } catch (e) {
      if (e.code === 4902) {
        alert('Unknow network, please add it before retry.');
        return;
      }
      console.error('Error while Switching Network: ', e);
    }
  }

  return (
    <AuthContext.Provider value={{ selectedAddress, _connectWallet, _switchNetwork, balance, _checkUserConnection, _provider }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
