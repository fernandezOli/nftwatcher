class NftWatcher {
  #started = false;

	//constructor() {}

	start(provider, contractAddress, userAddress, callbackFunc) {
    if (this.#started) return;
		this.provider = provider;
		this.contractAddress = contractAddress;
		this.userAddress = userAddress;
		this.callbackFunc = callbackFunc;
    try {
      this.provider.on("block", (blockNumber) => { this.parseBlock(blockNumber)});
      console.log('Watcher started ...');
      this.#started = true;
		  return true;
    } catch(error) {
      console.error('Error starting watcher: ', error);
      return false;
    }
  }

  stop() {
    if (!this.#started) return;
    try {
      this.provider.removeAllListeners("block");
      console.log('Watcher stopped ...');
      this.#started = false;
      return true;
    } catch (error) {
      console.error('Error stoping watcher: ', error);
      return false;
    }
  }

  async parseBlock(blockNumber) {
    try {
      const result = await this.provider.getBlockWithTransactions(blockNumber);
      if (result.transactions.length === 0) return;

      let sendEvent = false;
      for (let i = 0; i < result.transactions.length; i++) {
        if (result.transactions[i].from === undefined || result.transactions[i].from === null) continue;
        //console.log('transaction (before from): ', result.transactions[i]);
        if (result.transactions[i].from.toLowerCase() === this.userAddress[0].toLowerCase()) {
          sendEvent = true;
          console.log('transaction (from): ', result.transactions[i]);
          // wait transaction to finish
          //await this.provider.waitForTransaction(result.transactions[i].hash,1);
          break;
        }
      }
      if (sendEvent) this.callbackFunc();
    }
    catch (error) {
      console.error('Error parsing Block: ', error);
      return false;
    }
  }
}

export default NftWatcher;
