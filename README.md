# Web3 Connector

Module allow ct.js connect Web3 Metamask wallet to your game and sign transactions, call your smart-contract and use Alchemy NFT API to get additional
information about NFTs.

### Install & Configure

1. Import catmod into ct.js and enable it to start usage.
2. Open catmod settings and fill all you chain and contract details. You can use pre-defined chain configuration or setup custom chain settings.
3. If you need access to Alchemy NFT API - enable in settings and fill Alchemy NFT API Key.

## Variables

#### Check the user's metamask connection (boolean):

``` 
ct.web3.isConnected
```

#### Get current user metamask address (string):

``` 
ct.web3.userAddress
```

#### Get your contract Address (from catmod settings):

``` 
ct.web3.contractAddress
```

#### Get access to all public contract methods (using Contract ABI from catmod settings):

``` 
ct.web3.contract
```

#### Get access to Alchemy NFT API methods (Alchemy API Key required):

``` 
ct.web3.nft
```

------

## Methods

#### Connect Metamask:

Add connect action to your Connect button template (On Step):

``` 
ct.web3.connect();
```

#### Call your custom contract methods:

``` 
ct.web3.contract.callMethodName(params);
```

#### Listen metamask Account change and call your custom code:

``` 
ct.web3.onAccountChange(()=> {
    console.log('call my event onAccountChange');
});
```

#### Listen metamask Network change and call your custom code:

``` 
ct.web3.onNetworkChange(()=> {
    console.log('call my event onNetworkChange');
});
```

#### Show transaction status (small popup with transaction id, link and status):

``` 
ct.web3.showNewTransaction(tx);
```

------

## Alchemy NFT API usage:

Alchemy API Key required.

#### Get all user NFTs from your contract:

``` 
ct.web3.nft.getNFTs({
    owner: ct.web3.userAddress, 
    contractAddresses: [ct.web3.contractAddress]
}).then(result => {
    console.log('User Nfts', result.ownedNfts);
});
```

#### Gets the metadata associated with a given NFT:

``` 
ct.web3.nft.getNFTMetadata({
    tokenId: 1, 
    contractAddress: [ct.web3.contractAddress]
}).then(result => {
    console.log('NFTMetadata', result);
});
```

#### Queries NFT high-level collection/contract level information:

``` 
ct.web3.nft.getContractMetadata({
    contractAddress: [ct.web3.contractAddress]
}).then(result => {
    console.log('ContractMetadata', result);
});
```

#### Gets NFTs for a given NFT contract:

Use "startToken" and "limit" for pagination.

``` 
ct.web3.nft.getNFTsForCollection({
    contractAddress: [ct.web3.contractAddress],
    withMetadata: true
}).then(result => {
    console.log('First 100 NFTs', result);
});
```

#### Get the owner(s) for a token:

``` 
ct.web3.nft.getOwnersForToken({
    contractAddress: [ct.web3.contractAddress],
    tokenId: 1,
}).then(result => {
    console.log('First 100 NFTs', result);
});
```

#### Gets all owners for a given NFT contract:

``` 
ct.web3.nft.getOwnersForCollection({
    contractAddress: [ct.web3.contractAddress]
}).then(result => {
    console.log('First 100 NFTs', result);
});
```

------

## Usage Examples

### Show connect button and redirect to next room when wallet connected:

1. Create new room with metamask connection button and set it as starting room.
2. Add next code to metamask connection button (On Step):

``` 
if (ct.pointer.collides(this, undefined, true)) {
    ct.web3.connect();
}
```

*NOTE: In this example we use Pointer catmod, but you can replace to Touch or Mouse usage.*

3. Put next code into "On Step" room events to redirect user when metamask will be connected:

```
 if(ct.web3.isConnected) {
   ct.rooms.switch('MainMenu');
 }
```

### Show user wallet address in UI:

Next room can render connected user wallet address in short form:

```
this.accountLabel = new PIXI.Text('Account: ' + ct.web3.userAddress.slice(0, 5) + '...' + ct.web3.userAddress.slice(38, 42));
this.addChild(this.accountLabel);
this.accountLabel.x = 30;
this.accountLabel.y = 30;
this.accountLabel.depth = 1000;
```

### Show transaction status:

Transaction status is small popup with transaction id, link and current status that will be updated automatically.

``` 
try {
    const tx = await ct.web3.contract.CONTRACT_METHOD();
    ct.web3.showNewTransaction(tx);
} catch (e) {
    console.log('User decline transaction or failed');
};
```

*NOTE: Replace CONTRACT_METHOD to your contract method.*
