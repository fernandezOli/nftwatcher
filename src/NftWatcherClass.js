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
          await this.confirmTransaction(result.transactions[i].blockNumber, 1);
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

  //**** wait confirm transaction ****
  async confirmTransaction(blockNumber, blocksToWait) {
    console.log('waiting confirmation ...');
    let oldNumber = blockNumber;
    try {
      for (let i = 0; i < 10; i++) {
        await this.sleep(5000);
        try {
          var current = await this.provider.getBlock('latest');
          if (current.number - blockNumber >= blocksToWait) {
            return true;
          }
          if (oldNumber !== current.number) {
            i = 0;
            oldNumber = current.number;
          }
          continue;
        }
        catch (e) {
          console.error('Error for in confirmTransaction: ', e);
          return false;
        }
      }
      console.error('Error confirmTransaction: i > max wait for block');
      return false;
    } catch (e) {
      console.error('Error confirmTransaction: ', e);
      return false;
    }
  }

  async sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

export default NftWatcher;
