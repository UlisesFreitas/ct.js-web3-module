// Get Chain settings
const currentChain = [/*%customChain%*/][0] ? {
  chainId: Number("/*%chainId%*/"),
  chainName: "/*%chainName%*/",
  rpcUrls: ["/*%chainRPC%*/"],
  blockExplorerUrls: ["/*%blockExplorerUrl%*/"],
  currencySymbol: "/*%currencySymbol%*/",
  currencyDecimals: Number("/*%currencyDecimals%*/"),
} : window.defaultChainSettings["/*%chain%*/"];

let accountChangedCallback = () => {
};
let networkChangedCallback = () => {
};

/**
 * Show new transaction event
 * @param tx - transaction object
 * @param position string - where show transaction info block. Default: "bottom-center". Options: top-center, bottom-center, top-right, bottom-right
 */
const showNewTransaction = (tx, position) => {
  // Test to see if the browser supports the HTML template
  if ('content' in document.createElement('template')) {
    const transactionsBlock = document.getElementById('transactions');
    transactionsBlock.classList.add('visible');

    const template = document.getElementById('one-transaction-template');
    const txTemplate = template.content.cloneNode(true);

    const txBlock = txTemplate.querySelector('.one-transaction');
    txBlock.dataset.id = +new Date();

    const txLink = txTemplate.querySelector('.tx-link');
    const txHideButton = txTemplate.querySelector('.tx-hide');
    const txLoader = txTemplate.querySelector('.tx-loader');
    const txStatus = txTemplate.querySelector('.tx-status');

    txLink.textContent = tx.hash.slice(0, 6) + "..." + tx.hash.slice(36, 42);
    txLink.href = currentChain.blockExplorerUrls[0] + "/tx/" + tx.hash;
    transactionsBlock.appendChild(txTemplate);

    // Listen to hide tx info and remove block
    const listener = () => {
      txHideButton.removeEventListener('click', listener);
      transactionsBlock.querySelector(`.one-transaction[data-id="${txBlock.dataset.id}"]`).remove();
    };
    txHideButton.addEventListener('click', listener);

    // Wait till status update
    tx.wait().then(receipt => {
      // Hide loader
      txLoader.remove();

      // Update tx status text
      if (receipt.status === 1) {
        txStatus.textContent = "Success";
      } else {
        txStatus.textContent = "Error";
      }

      // Remove Tx in 3 seconds after update
      setTimeout(() => {
        txHideButton.dispatchEvent(new Event('click'));
      }, 3000);
    });
  }
}

// Init catmod
ct.web3 = {
  chainId: currentChain.chainId,
  contractAddress: "/*%contractAddress%*/",
  connectOnInit: [/*%connectOnInit%*/][0],
  showWrongNetwork: [/*%showWrongNetwork%*/][0],
  isConnected: false,
  userAddress: "",
  contract: {},
  nft: {},
  connect: () => alert("Please Install metamask"),
  onAccountChange: (callback) => accountChangedCallback = callback,
  onNetworkChange: (callback) => networkChangedCallback = callback,
  showNewTransaction: (tx, position) => showNewTransaction(tx, position),
};

// Show alerts when no required settings
if (!ct.web3.chainId) {
  alert('Web3 Connector error: ChainID is empty');
} else if (!ct.web3.contractAddress) {
  alert('Web3 Connector error: contract address is empty');
}

if (window.ethereum) {
  console.log('chainId', ct.web3.chainId);
  console.log('contractAddress', ct.web3.contractAddress);

  const provider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');

  const isCorrectNetwork = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return Number(chainId) === ct.web3.chainId;
  }

  // Replace method to connect user metamask account
  ct.web3.connect = async () => {
    ct.web3.isConnected = false;
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    ct.web3.userAddress = await signer.getAddress();
    console.log("Account:", ct.web3.userAddress);

    try {
      isCorrectNetwork().then(isCorrect => {
        if (isCorrect) {
          const contractABI = [/*%contractABI%*/][0];
          ct.web3.contract = new ethers.Contract(
            ct.web3.contractAddress,
            contractABI.abi ? contractABI.abi : contractABI,
            signer
          );
          ct.web3.isConnected = true;
        }
      });
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

  const initAlchemy = () => {
    const callAlchemyAPI = async (method, params) => {
      const apiKey = "/*%alchemyKey%*/";
      const baseURL = window.defaultChainSettings["/*%chain%*/"].alchemyURL;

      if (baseURL.length) {
        let fetchURL = `${baseURL}/${apiKey}/${method}/`;
        if (Object.keys(params).length) {
          const searchParams = Object.keys(params).map(key => {
            if (Array.isArray(params[key])) {
              return params[key].map(item => key + '[]=' + item).join('&');
            } else {
              return key + '=' + params[key];
            }
          }).join('&');
          fetchURL += `?${searchParams}`;
        }

        return await fetch(fetchURL, {
          method: 'GET',
          redirect: 'follow'
        }).then(response => response.json());
      } else {
        alert('Chain not supported');
      }
    }

    /**
     * Gets all NFTs currently owned by a given address.
     * @param owner string (required) - Address for NFT owner.
     * @param pageKey string - UUID for pagination.
     * @param contractAddresses array of strings - Array of contract addresses to filter the responses with.
     * @param withMetadata boolean - if true query will include metadata for each returned token.
     * @param filters array of strings - Array of filters (as ENUMS) that will be applied to the query.
     * @link https://docs.alchemy.com/reference/getnfts
     * @return Promise
     */
    ct.web3.nft.getNFTs = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getNFTs', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };

    /**
     * Gets the metadata associated with a given NFT.
     * @param contractAddress string (required) - Address of NFT contract.
     * @param tokenId string (required) - Integer or Hexadecimal - Id for NFT.
     * @param tokenType string - 'ERC721' or 'ERC1155'.
     * @link https://docs.alchemy.com/reference/getnftmetadata
     * @return Promise
     */
    ct.web3.nft.getNFTMetadata = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getNFTMetadata', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };

    /**
     * Queries NFT high-level collection/contract level information.
     * @param contractAddress string (required) - Address of NFT contract.
     * @link https://docs.alchemy.com/reference/getcontractmetadata
     * @return Promise
     */
    ct.web3.nft.getContractMetadata = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getContractMetadata', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };

    /**
     * Gets minted NFTs for a given NFT contract.
     * @param contractAddress string (required) - Address of NFT contract.
     * @param withMetadata boolean - if true returns NFT metadata, otherwise will only return tokenIds.
     * @param startToken string - An offset used for pagination.
     * @param limit integer - Sets the total number of NFTs returned in the response. Defaults to 100.
     * @link https://docs.alchemy.com/reference/getnftsforcollection
     * @return Promise
     */
    ct.web3.nft.getNFTsForCollection = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getNFTsForCollection', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };

    /**
     * Get the owner(s) for a token.
     * @param contractAddress string (required) - Address of NFT contract.
     * @param tokenId string (required) - The ID of the token
     * @link https://docs.alchemy.com/reference/getownersfortoken
     * @return Promise
     */
    ct.web3.nft.getOwnersForToken = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getOwnersForToken', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };

    /**
     * Gets all owners for a given NFT contract.
     * @param contractAddress string (required) - Address of NFT collection.
     * @param withTokenBalances boolean - if true the query will include the token balances per token id for each owner.
     * @link https://docs.alchemy.com/reference/getownersforcollection
     * @return Promise
     */
    ct.web3.nft.getOwnersForCollection = (params) => {
      return new Promise((resolve, reject) => {
        callAlchemyAPI('getOwnersForCollection', params).then(result => {
          resolve(result);
        }).catch(err => reject(err));
      });
    };
  }

  // Reload game on switch chain
  const chainChangeEvent = () => {
    networkChangedCallback();
    initModule();
  };

  // Account change - connect and load new signer
  const accountChangeEvent = (account) => {
    accountChangedCallback();
    if (account.length) {
      initModule();
    } else {
      // metamask disconnected
      window.location.reload();
    }
  };

  const initModule = () => {
    const web3SwitchNetwork = document.querySelector(".web3-btn");

    // Cleanup listeners
    window.ethereum.removeListener("chainChanged", chainChangeEvent);
    window.ethereum.removeListener("accountsChanged", accountChangeEvent);
    web3SwitchNetwork.removeEventListener("click", switchNetwork);

    // Add listeners
    window.ethereum.on("chainChanged", chainChangeEvent);
    window.ethereum.on("accountsChanged", accountChangeEvent);
    web3SwitchNetwork.addEventListener("click", switchNetwork);

    isCorrectNetwork().then(isCorrect => {
      const alertMessage = document.getElementById('wrong-network-alert');
      if (!isCorrect) {
        // Show wrong network error message
        alertMessage.classList.add('visible');
      } else {
        // Hide wrong network error message
        alertMessage.classList.remove('visible');

        // Connect Metamask on init
        if (ct.web3.connectOnInit) {
          ct.web3.connect();
        }

        // Alchemy NFT API methods
        if ("/*%alchemyKey%*/") {
          initAlchemy();
        }
      }
    });
  }

  // Init module
  initModule();

} else {
  const alertMessage = document.getElementById('no-metamask-alert');
  alertMessage.classList.add('visible');
}
