const { BN, ether, balance } = require('openzeppelin-test-helpers');
const { expect } = require('chai');
const { asyncForEach } = require('./utils');

// ABI
const daiABI = require('./abi/dai');

// userAddress must be unlocked using --unlock ADDRESS
const userAddress = '0xdfbaf3e4c7496dad574a1b842bc85b402bdc298d';
const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
const daiContract = new web3.eth.Contract(daiABI, daiAddress);

contract('Truffle Mint DAI', async accounts => {
  it('should send ether to the DAI address', async () => {
    // Send 0.1 eth to userAddress to have gas to send an ERC20 tx.
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: userAddress,
      value: ether('0.1')
    });
    const ethBalance = await balance.current(userAddress);
    expect(new BN(ethBalance)).to.be.bignumber.least(new BN(ether('0.1')));
  });

  it('should mint DAI for our first 5 generated accounts', async () => {
    // Get 100 DAI for first 5 accounts
    await asyncForEach(accounts.slice(0, 5), async account => {
      // daiAddress is passed to ganache-cli with flag `--unlock`
      // so we can use the `transfer` method
      await daiContract.methods
        .transfer(account, ether('100').toString())
        .send({ from: userAddress, gasLimit: 800000 });
      const daiBalance = await daiContract.methods.balanceOf(account).call();
      expect(new BN(daiBalance)).to.be.bignumber.least(ether('100'));
    });
  });
});