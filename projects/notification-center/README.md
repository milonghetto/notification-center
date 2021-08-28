# NotificationCenterService

A notification dispatch mechanism which enables the broadcast of information to registered observers.

## Overview

Components register with the notification center to receive notifications [(Notification objects)]() using the [addObserver]() set of overloaded methods.  When a component adds itself as an observer, it specifies which notification(s) it should receive.  A component may, therefore, call this method several times in order to register itself, as an observer, for several different notifications.

Components may also post notifications via the notification center to have these notifications delivered to those components which have all-ready registered with the notification center to receive notifications.

A notification center may deliver notifications only within the application in which it has been imported, and injected.

## Installation

Use the Node Package Manager [npm](https://nodejs.org/en/), which comes packaged with node.js, to install NotificationCenterService:

```bash
npm install --save @jtablada/notification-center
```
or
```bash
npm install --global @jtablada/notification-center
```

## Usage

### app.module.ts

Import the service in the file [app.module.ts]() to make it available throughout the application.

```typescript
import { NotificationCenterService } from "@jtablada/notification-center";

@NgModule ( { declarations: [ ... ],
              imports: [ ... ],
              providers: [ NotificationCenterService ],
              bootstrap: [ ... ] } )

export class AppModule {}
```

### observing-class.component.ts

The component registering for notifications needs to:
1. Import the NotificationCenterService from "@jtablada/notification-center".
2. Inject the service into the class via its constructor by passing it as a parameter.
3. Implement the interface [OnDestroy]():
   1. Implement the method [ngOnDestroy]().
   2. Within the method, removing itself by implementing the [removeObserver]() method.
      1. [this._notificationCenter_.removeObserver ( this );]()
4. Implement the interface [OnInit]():
   1. Implement the method [ngOnInit]().
   2. Register for any or all notifications necessary implementing any form of the overloaded method [addObserver]().

Throughout the component, one may add and remove the component to the notification center as needed based on
application architecture needs and business rules.

```typescript
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Notification,
         NotificationCenterService } from "@jtablada/notification-center";
import { MessagingClassComponent } from "./messaging-class.component";

@Component ( { selector: 'app-observing-class',
               templateUrl: './app-observing-class.html',
               styleUrls: [ './app-observing-class.css' ] } )

export class ObservingClassComponent extends OnDestroy,
                                             OnInit
{
    @Input ( 'notifying-class' ) notifyingClassRef : NotifyingClass | null = null;

    private readonly _notificationCenter_ : NotificationCenter;

    constructor ( notificationCenter : NotificationCenter )
    {
        this._notificationCenter_ = NotificationCenter;
    }

    ngOnDestroy () : void
    {
        // ALWAYS USE THIS FORM OF THE removeObserver METHOD HERE. IN ngOnDestroy ().
        this._notificationCenter_.removeObserver ( this );

        // Use this form of the removeObserver method to stop listening to a specic
        // message no matter which component sends it.
        this._notificationCenter_.removeObserver ( this,
                                                   MessagingClassComponent.MESSAGE_CONSTANT );

        // Use this form of the removeObserver method to stop listening to a specific
        // message being sent from a specific sender.
        this._notificationCenter_.removeObserver ( this,
                                                   MessagingClassComponent.MESSAGE_CONSTANT,
                                                   notifyingClassRef );

        // Use this form of the removeObserver method to stop listening to any message
        // being sent from a specific sender.
        this._notificationCenter_.removeObserver ( this,
                                                   null,
                                                   notifyingClassRef );
    }

    ngOnInit () : void
    {
        // Use this form to receive any notification irrespective of the sender.
        this._notificationCenter_.addObserver ( this,
                                                this.notificationHandler.bind ( this ) );

        // Use this form to receive a specific notification from any sender.
        // Multiple instances of a component may send the same notification.
        this._notificationCenter_.addObserver ( this,
                                                this.notificationHandler.bind ( this ),
                                                MessagingClassComponent.MESSAGE_CONSTANT );

        // Use this form to receive a specific notification from a specific sender.
        this._notificationCenter_.addObserver ( this,
                                                this.notificationHandler.bind ( this ),
                                                MessagingClassComponent.MESSAGE_CONSTANT,
                                                notifyingClassRef );

        // Use this form to receive any notification posted by a specific sender.
        this._notificationCenter_.addObserver ( this,
                                                this.notificationHandler.bind ( this ),
                                                null,
                                                notifyingClassRef );
    }

    public notificationHandler ( notification : Notification ) : void
    {
    }
}
```

### messaging-class.component.ts
```typescript
import { Component } from "@angular/core";
import { NotificatonCenterService,
         UserInfo } from "@jtablada/notification-center";

@Component ( { selector: 'app-messaging-class',
               templateUrl: './app-messaging-class.html',
               styleUrls: [ './app-messaging-class.css' ] } )

export class MessagingClassComponent
{
    public static readonly MESSAGE_CONSTANT : string = '_MESSAGE_CONSTANT_';

    private _notificationCenter_ : NotificationCenterService;

    constructor ( notificationCenter : NotificationCenterService )
    {
        this._notificationCenter_ = notificationCenter;
    }

    public someMethod () : void
    {
        // Use this form to send a packaged notification object.
        const notification : Notification = { name   : MessagingClassComponent.MESSAGE_CONSTANT,
                                              sender : this };

        this._notificationCenter.postNotification ( notification );

        // Use this form to send custom data within the packaged notification.
        const userInfo : UserInfo = { 'age'    : 25,
                                      'address': '123 Main Street',
                                      'list'   : [ 'a', 'b', 'c' ] };

        notification = { name     : MessagingClassComponent.MESSAGE_CONSTANT,
                         sender   : this,
                         userInfo : userInfo };

        this._notificationCenter_.postNotification ( notification );

        this._notificationCenter_.postNotification ( MessagingClassComponent.MESSAGE_CONSTANT,
                                                     this );

        this._notificationCenter_.postNotification ( MessagingClassComponent.MESSAGE_CONSTANT,
                                                     this,
                                                     userInfo );
    }
}
```

### container-class.html
```html
<app-messaging-class #messagingComponent></app-messaging-class>

<app-observing-class [notifying-class]="messagingComponent"></app-observing-class>
```
## License
[MIT](https://choosealicense.com/licenses/mit/)
