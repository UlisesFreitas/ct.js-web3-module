// ct.random

// Chain settings
const currentChain = [/*%customChain%*/][0] ? {
  chainId: Number("/*%chainId%*/"),
  chainName: "/*%chainName%*/",
  rpcUrls: ["/*%chainRPC%*/"],
  blockExplorerUrls: ["/*%blockExplorerUrl%*/"],
  currencySymbol: "/*%currencySymbol%*/",
  currencyDecimals: Number("/*%currencyDecimals%*/"),
} : window.defaultChainSettings["/*%chain%*/"];


ct.web3 = {
  chainId: currentChain.chainId,
  contractAddress: "/*%contractAddress%*/",
  contractABI: [/*%contractABI%*/][0],
  connectOnInit: [/*%connectOnInit%*/][0],
  showWrongNetwork: [/*%showWrongNetwork%*/][0],
  isConnected: false,
  userAddress: "",
  contract: {},
  connect: () => {
    alert("Please Install metamask");
  },
};

if (!ct.web3.chainId) {
  alert('Web3 Connector error: ChainID is empty');
} else if (!ct.web3.contractAddress) {
  alert('Web3 Connector error: contract address is empty');
}

if (window.ethereum) {
  const provider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');

  console.log('chainId', ct.web3.chainId);
  console.log('contractAddress', ct.web3.contractAddress);

  // Connect user metamask account
  ct.web3.connect = async () => {
    ct.web3.isConnected = false;
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    ct.web3.userAddress = await signer.getAddress();
    ct.web3.isConnected = true;
    console.log("Account:", ct.web3.userAddress);

    try {
      ct.web3.contract = new ethers.Contract(
        ct.web3.contractAddress,
        ct.web3.contractABI.abi ? ct.web3.contractABI.abi : ct.web3.contractABI,
        signer
      );
    } catch (e) {
      alert("Error on contract initialisation, please check Contract ABI");
    }
  };

  const switchNetwork = async () => {
    const chainHex = ethers.utils.hexStripZeros(ethers.utils.hexlify(ct.web3.chainId));
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 && ct.web3.chainId) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainHex,
              chainName: currentChain.chainName,
              rpcUrls: currentChain.rpcUrls,
              blockExplorerUrls: currentChain.blockExplorerUrls,
              nativeCurrency: {
                symbol: currentChain.currencySymbol,
                decimals: currentChain.currencyDecimals
              }
            }]
        });
      }
    }
  }

  const initNetwork = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (Number(chainId) !== ct.web3.chainId) {
      // Add switch network listener
      document.querySelector(".web3-btn").addEventListener("click", switchNetwork);

      // Show wrong network error message
      const alertMessage = document.getElementById('wrong-network-alert');
      alertMessage.classList.add('visible');
    }

    // Reload game on switch chain
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    // Account change - connect and load new signer
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
      // ct.web3.connect();
    });
  }

  initNetwork().then(() => {
    if (ct.web3.connectOnInit) {
      ct.web3.connect();
    }
  });

} else {
  const alertMessage = document.getElementById('no-metamask-alert');
  alertMessage.classList.add('visible');
}


