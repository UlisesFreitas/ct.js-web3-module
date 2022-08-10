// Get Chain settings
const currentChain = [/*%customChain%*/][0] ? {
  chainId: Number("/*%chainId%*/"),
  chainName: "/*%chainName%*/",
  rpcUrls: ["/*%chainRPC%*/"],
  blockExplorerUrls: ["/*%blockExplorerUrl%*/"],
  currencySymbol: "/*%currencySymbol%*/",
  currencyDecimals: Number("/*%currencyDecimals%*/"),
} : window.defaultChainSettings["/*%chain%*/"];

// Init catmod
ct.web3 = {
  chainId: currentChain.chainId,
  contractAddress: "/*%contractAddress%*/",
  contractABI: [/*%contractABI%*/][0],
  connectOnInit: [/*%connectOnInit%*/][0],
  showWrongNetwork: [/*%showWrongNetwork%*/][0],
  isConnected: false,
  userAddress: "",
  contract: {},
  nft: {},
  connect: () => {
    alert("Please Install metamask");
  },
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
      ct.web3.contract = new ethers.Contract(
        ct.web3.contractAddress,
        ct.web3.contractABI.abi ? ct.web3.contractABI.abi : ct.web3.contractABI,
        signer
      );
      ct.web3.isConnected = true;
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
    isCorrectNetwork().then(isCorrect => {
      if (!isCorrect) {
        // Add switch network listener
        document.querySelector(".web3-btn").addEventListener("click", switchNetwork);

        // Show wrong network error message
        const alertMessage = document.getElementById('wrong-network-alert');
        alertMessage.classList.add('visible');
      }
    });

    // Reload game on switch chain
    window.ethereum.on("chainChanged", () => {
      // window.location.reload();
      ct.web3.connect();
    });

    // Account change - connect and load new signer
    window.ethereum.on("accountsChanged", (account) => {
      if (account.length) {
        // account switched
        ct.web3.connect();
      } else {
        // metamask disconnected
        window.location.reload();
      }
    });
  }

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

  initNetwork().then(() => {
    // Connect Metamask
    if (ct.web3.connectOnInit) {
      ct.web3.connect();
    }

    // Add Alchemy NFT API methods
    if ("/*%alchemyKey%*/") {
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
       * Gets all NFTs for a given NFT contract.
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
  });

} else {
  const alertMessage = document.getElementById('no-metamask-alert');
  alertMessage.classList.add('visible');
}
