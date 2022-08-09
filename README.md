# Web3 Connector

This module allow to connect web3 metamask wallet to your game.

### Install & Configure

1. Import this catmod into ct.js and enable it to start usage.
2. Open catmod settings and fill all you chain and contract details. You can use pre-defined chain configuration or setup custom chain settings.

### Catmod variables

Test the user's metamask connection (boolean):

``` 
ct.web3.isConnected
```

Get user's metamask address (string):

``` 
ct.web3.userAddress
```

### Catmod methods

*Connect Metamask*

Add connect action to your Connect button template (on Step):

``` 
if (ct.pointer.collides(this, undefined, true)) {
    ct.web3.connect();
}
```

### Usage examples

**1. Show connect button and redirect to next room when wallet connected.**

- Create new room and set it as starting room.
- Add metamask connection button template and put code into "On Step" room events:

```
 if(ct.web3.isConnected) {
   ct.rooms.switch('MainMenu');
 }
```

**2. Show user wallet address in UI.**

Next room can render connected user wallet address in short form:

```
this.accountLabel = new PIXI.Text('Account: ' + ct.web3.userAddress.slice(0, 5) + '...' + ct.web3.userAddress.slice(38, 42));
this.addChild(this.accountLabel);
this.accountLabel.x = 30;
this.accountLabel.y = 30;
this.accountLabel.depth = 1000;
```
