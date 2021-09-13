# NotificationCenterService

A notification dispatch mechanism which enables the broadcast of information to registered observers.

## Overview

Components register with the notification center to receive notifications (`Notification` objects) using the `addObserver()` set of overloaded methods.  When a component adds itself as an observer, it specifies which notification(s) it should receive.  A component may, therefore, call this method several times in order to register itself, as an observer, for several different notifications.

Components may also post notifications via the notification center to have these notifications delivered to those components which have all-ready registered with the notification center to receive notifications.

A notification center may deliver notifications only within the application in which it has been imported, and injected.

## Installation

Use the Node Package Manager, [npm](https://nodejs.org/), which comes packaged with [node.js](https://nodejs.org/), to install NotificationCenterService:

```bash
npm install --save @jtablada/notification-center
```
or
```bash
npm install --global @jtablada/notification-center
```

## Details

The service, [NotificationCenterService](), is made-up of three (3) methods, each of which is overloaded and which has
a particular usage:
1. `addObserver()`
   1. `addObserver ( observer, handler )` <br /> Registers the [observer]() to be notified, via the [handler]() method, of any [Notification]() posted by any sender.
   2. `addObserver ( observer, handler, name )` <br /> Registers the [observer]() to be notified, via the [handler]() method, of any [Notification]() the [name]() posted by any sender.
   3. `addObserver ( observer, handler, name, sender )` <br /> Registers the [observer]() to be notified, via the [handler]() method, of any notification with the [name]() posted by a specific [sender]().
   4. `addObserver ( observer, handler, null, sender )` <br /> Registers the [observer]() to be notified, via the [handler]() method, of any notification with any name posted by a specific [sender]().
2. `removeObserver()`
   1. `removeObserver ( observer )` <br /> Removes the [observer]() from the list of observers registered to receive notifications posted by any sender.  Best used inside the method [ngOnDestroy()]().
   2. `removeObserver ( observer, name )` <br />Removes the [observer]() from the list of observers registered to receive notifications with the [name]() posted by any sender.  Use anywhere outside the method [ngOnDestroy]().
   3. `removeObserver ( observer, message, sender )` <br /> Removes the [observer]() from the list of observers registered to receive notifications with the [name]() posted by [sender]().  Use anywhere outside the method [ngOnDestroy]().
   4. `removeObserver ( observer, null, sender )` <br /> Removes the [observer]() from the list of observers registered to received all notifications posted by [sender]().  Use anywhere outside the method [ngOnDestroy]().
3. `postNotification()`
   1. `postNotification ( notification )` <br /> A convenience method which posts a [Notification]() object.  The [Notification]() object contains the name, the sender, and an optional [UserInfo]() object, through which custom data may be passed by the sender to all observers.
   2. `postNotification ( name, sender )` <br /> Posts a notification made-up of only the name and a reference to the sender.
   3. `postNotification ( name, sender, userinfo )` <br /> Posts a notification made-up of the name, the reference to the sender, and custom information passed along in the notification.  The [userinfo]() parameter is of type [UserInfo](), which is an object of key-value pairs.
   
## Usage

### app.module.ts
Import the service, `NotificationCenterService`, into the file `app.module.ts`, and add it to the [providers]()
array to make it available throughout the application.
```typescript
import { NotificationCenterService } from "@jtablada/notification-center";

@NgModule ( { declarations: [ ... ],
              imports: [ ... ],
              providers: [ NotificationCenterService ],
              bootstrap: [ ... ] } )

export class AppModule {}
```

### Posting notifications
In any component from which `Notification`(s) will be posted:
```typescript
import { Notification,
         NotificationCenterService } from "@jtablada/notification-center";
```

```typescript
constructor ( private notificationCenter : NotificationCenterService )
{
}
```

```typescript
this.notificationCenter.postNotification ( 'ServerFailedToConnect',
                                           this );
```

```typescript
const notification : Notification = { name   : 'ServerFailedToConnect',
                                      sender : this };

this.notificationCenter.postNotification ( notification );
```

```typescript
const userInfo : UserInfo = {};

userInfo [ 'products' ] = [ { id       : 0,
                              name     : 'product 01',
                              quantity : 15 },

                            { id       : 17,
                              name     : 'product 02',
                              quantity : 32 } ];

this.notificationCenter.postNotification ( 'ProductsSuccessfullyLoaded',
                                           this,
                                           userInfo );
```

```typescript
const userInfo : UserInfo = {};

userInfo [ 'products' ] = [ { id       : 0,
                              name     : 'product 01',
                              quantity : 15 },

                            { id       : 17,
                              name     : 'product 02',
                              quantity : 32 } ];

const notification : Notification = { name     : 'ProductsSuccessfullyLoaded',
                                      sender   : this,
                                      userInfo : userInfo };

this.notificationCenter.postNotification ( notification );
```

### Registering for notifications
```typescript
import { OnInit } from "@angular/core";
import { Notification,
         NotificationCenterService } from "@jtablada/notification-center";
```

```typescript
constructor ( private notificationCenter : NotificationCenterService )
{
}
```

```typescript
ngOnInit () : void
{
    this.notificationCenter.addObserver ( this,
                                          this.notificationHandler );
}

public notificationHandler ( notification : Notification ) : void
{
    if ( notification.name === 'ProductsSuccessfullyLoaded' )
    {
    }
    else if ( notification.name === 'ServerFailedToConnect' )
    {
    }
}
```

```typescript
ngOnInit () : void
{
    this.notificationCenter.addObserver ( this,
                                          this.productsHandler,
                                          'ProductsSuccessfullyLoaded' );

    this.notificationCenter.addObserver ( this,
                                          this.serverHandler,
                                          'ServerFailedToConnect' );
}

public productsHandler ( notification : Notification ) : void
{
}

public serverHandler ( notification : Notification ) : void
{
}
```

### Registering for notifications posted by a particular component

```
<app-product-list #productList></app-product-list>

<app-shopping-cart [products]="productList"></app-shopping-cart>
```

```typescript
import { Component } from "@angular/core";
import { Notification,
         NotificationCenterService } from "@jtablada/notification-center";

export type Product = { name     : string;
                        price    : number;
                        quantity : number };

export type Products = Product [];

@Component ( { selector: 'app-product-list' } )

export class ProductListComponent
{
    public static readonly AddProductToCart : string = 'AddProductToCart';

    constructor ( private notificationCenter : NotificationCenterService )
    {
    }

    public onClickEventHandler ( product : Product ) : void
    {
        const userInfo : UserInfo = {};

        userInfo [ 'product' ] = { name     : product.name,
                                   price    : product.price,
                                   quantity : product.quantity };

        this.notificationCenter.postNotification ( 'AddProductToCart',
                                                   this,
                                                   userInfo );
    }
}
```

```typescript
import { Component, Input } from "@angular/core";
import { Notification,
         NotificationCenterService } from "@jtablada/notification-center";
import { Product, Products, ProductListComponent } from "./product-list.component";

@Component ( { selector : 'app-shopping-cart' } )

export class ShoppingCartComponent implements OnDestroy
{
    @Input ( 'products' ) productsRef : ElementRef;

    private cartItems : Products;

    constructor ( private notificationCenter : NotificationCenter )
    {
        this.cartItems = [];
        this.notificationCenter.addObserver ( this,
                                              this.notificationHandler.bind ( this ),
                                              ProductListComponent.AddProductToCart,
                                              this.productsRef );
    }

    public notificationHandler ( notification : Notification ) : void
    {
        const userInfo : UserInfo = notification.userInfo;
        const product  : Product  = userInfo [ 'product' ];

        this.cartItems.push ( product );
    }
}
```

### Removing observer from `NotificationCenterService`
```typescript
@import { OnDestroy } from "@angular/core";
@import { Notification,
          NotificationCenterService } from "@jtablada/notification-center";
```

```typescript
constructor ( private notificationCenter : NotificationCenterService )
{
}
```

```typescript
ngOnDestroy () : void
{
  // ALWAYS -- Use this form inside ngOnDestroy()
  this.notificationCenter.removeObserver ( this );
}
```

```typescript
public startObservingEvents () : void
{
    this.notificationCenter.addObserver ( this,
                                          this.serverDidFailNotificationHandler.bind ( this ),
                                          'ServerDidFailNotification' );
    
    this.notificationCenter.addObserver ( this,
                                          this.serverDidLoadInfoNotificationHandler.bind ( this),
                                          'ServerDidLoadInfoNotification' );
}

public stopObservingEvents () : void
{
    this.notificationCenter.removeObserver ( this,
                                             'ServerDidFailNotification' );
   
    this.notificationCenter.removeObserver ( this,
                                             'ServerDidLoadInfoNotification' );
}
```

```typescript
public onClickEventHandler () : void
{
    this.startObservingEvents ();
    
    // Make the necessary server request to load data.
}
```

```typescript
public serverDidFailNotificationHandler ( notification : Notification ) : void
{
    this.stopObservingEvents ();
    
    // Handle failure here.
}

public serverDidLoadInfoNotificationHandler ( notification : Notification ) : void
{
    this.stopObservingEvents ();
    
    // Handle results sent by the server here...
}
```


## License
[The MIT License](https://choosealicense.com/licenses/mit/) <br>
Copyright &copy; 2021 Johnny Alexander Tablada-Rodríguez [alexandertablada@hotmail.com](mailto:alexandertablada@hotmal.com). <br>
&reg; All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
