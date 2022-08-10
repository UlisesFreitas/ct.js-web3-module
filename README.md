# Web3 Connector

This module allow to connect web3 metamask wallet to your game.

### Install & Configure

1. Import this catmod into ct.js and enable it to start usage.
2. Open catmod settings and fill all you chain and contract details. You can use pre-defined chain configuration or setup custom chain settings.
3. If you need access to Alchemy NFT API - enable in settings and fill Alchemy NFT API Key.

## Variables

Check the user's metamask connection (boolean):

``` 
ct.web3.isConnected
```

Get connected user metamask address (string):

``` 
ct.web3.userAddress
```

Get your contract Address (from catmod settings):

``` 
ct.web3.contractAddress
```

Get access to your contract methods (using Contract ABI from catmod settings):

``` 
ct.web3.contract
```

Get access to Alchemy NFT API methods (Alchemy API Key required):

``` 
ct.web3.nft
```

------

## Methods

#### Connect Metamask:

Add connect action to your Connect button template (On Step):

``` 
if (ct.pointer.collides(this, undefined, true)) {
    ct.web3.connect();
}
```

#### Call your custom contract methods:

``` 
if (ct.pointer.collides(this, undefined, true)) {
    ct.web3.contract.callMethodName(params)
}
```

#### Call Alchemy NFT API (Alchemy API Key required):

Get all user NFTs from your contract

``` 
ct.web3.nft.getNFTs({
    owner: ct.web3.userAddress, 
    contractAddresses: [ct.web3.contractAddress]
}).then(result => {
    console.log('User Nfts', result.ownedNfts);
});
```

------

## Usage Examples

#### Show connect button and redirect to next room when wallet connected:

- Create new room and set it as starting room.
- Add metamask connection button template and put code into "On Step" room events:

```
 if(ct.web3.isConnected) {
   ct.rooms.switch('MainMenu');
 }
```

#### Show user wallet address in UI:

Next room can render connected user wallet address in short form:

```
this.accountLabel = new PIXI.Text('Account: ' + ct.web3.userAddress.slice(0, 5) + '...' + ct.web3.userAddress.slice(38, 42));
this.addChild(this.accountLabel);
this.accountLabel.x = 30;
this.accountLabel.y = 30;
this.accountLabel.depth = 1000;
```
