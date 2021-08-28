// ***********************************************************************************************************
//
// Author: Johnny Alexander Tablada-Rodriguez
// Created On: Friday, 20 August, 2021
// File: notification-center.service.ts
// Project: notification-center-service
// Notice: Copyright (c) 2021.  (R)All rights reserved.
//
// ***********************************************************************************************************

   import { Injectable }                         from "@angular/core";
   import { Subject, Subscription }              from "rxjs";

   export interface UserInfo { [ key : string ] : Object }

   export interface Notification { name      : string,
                                   sender    : Object,
                                   userInfo ?: UserInfo | null }

   export type NotificationSubject = Subject <Notification>;

   export type NotificationHandler = ( notification : Notification ) => void;

   export type Sender = Object | null;

   export type Subscriber = { observer      : Object,
                              name         ?: string,
                              handler      ?: NotificationHandler,
                              sender       ?: Sender,
                              subscription ?: Subscription };

   export type Subscribers = Subscriber [];
   
   export type Publisher = { subject     : NotificationSubject,
                             sender     ?: Sender,
                             subscribers : Subscribers };
   
   export type Publishers = Publisher [];

   export interface Emitters { [ index : string ] : Publishers }

// ***********************************************************************************************************
//

   @Injectable ( { providedIn : 'root' } )

   export class NotificationCenterService
   {
       private readonly _emitters_              : Emitters;
       private readonly _subscribersToAnyByAny_ : Subscribers;
       private readonly _subscribersToAnyByOne_ : Subscribers;
       private readonly _subscribersToOneByAny_ : Subscribers;

   // ========================================================================================================
      
      constructor ()
      {
          this._emitters_              = {};
          this._subscribersToAnyByAny_ = [];
          this._subscribersToAnyByOne_ = [];
          this._subscribersToOneByAny_ = [];
      }
    
   // ========================================================================================================
       
       public displayArrays () : void
       {
           console.log ( '/'.repeat ( 80 ) );
           console.log ( this._subscribersToAnyByAny_ );
           console.log ( this._subscribersToAnyByOne_ );
           console.log ( this._subscribersToOneByAny_ );
           console.log ( this._emitters_ );
           console.log ( '\\'.repeat ( 80 ) );
       }
       
   // ========================================================================================================
    
      public addObserver ( observer            : Object,
                           notificationHandler : NotificationHandler ) : void;
      public addObserver ( observer            : Object,
                           notificationHandler : NotificationHandler,
                           name                : string | null ) : void;
      public addObserver ( observer            : Object,
                           notificationHandler : NotificationHandler,
                           name                : string | null,
                           sender              : Sender ) : void;
      public addObserver ( observer            : Object,
                           notificationHandler : NotificationHandler,
                           name               ?: string | null,
                           sender             ?: Sender ) : void
      {
          const noSpecificMessage : boolean = ( name   === undefined || name   === null );
          const noSpecificSender  : boolean = ( sender === undefined || sender === null );
          const specificMessage   : boolean = ( name   !== undefined && name   !== null );
          const specificSender    : boolean = ( sender !== undefined && sender !== null );
    
          const createSubscriber = ( subject : NotificationSubject ) : Subscriber =>
                                   {
                                       const subscription : Subscription = subject.subscribe ( notificationHandler );
                                       const subscriber   : Subscriber   = { observer     : observer,
                                                                             subscription : subscription };
    
                                       return ( subscriber );
                                   };
    
          const createPublisher = () : Publisher =>
                                  {
                                      const subject     : NotificationSubject = new Subject <Notification> ();
                                      const subscriber  : Subscriber          = createSubscriber ( subject );
                                      const subscribers : Subscribers         = [ subscriber ];
                                      const publisher   : Publisher           = { subject     : subject,
                                                                                  sender      : sender,
                                                                                  subscribers : subscribers };
                                      
                                      return ( publisher );
                                  };
          
          const createPublishers = () : Publishers =>
                                   {
                                       const publisher  : Publisher  = createPublisher ();
                                       const publishers : Publishers = [ publisher ];
                                       
                                       return ( publishers );
                                   };
    
          const findPublisher = ( publisher : Publisher ) : boolean =>
                                {
                                    return ( noSpecificSender || ( sender === publisher.sender ) )
                                };
    
          const findSubscriber = ( subscriber : Subscriber ) : boolean =>
                                 {
                                     return ( subscriber.observer === observer );
                                 };
          
          const subscribe = ( publisher : Publisher ) : void =>
                            {
                                if ( noSpecificSender || ( sender === publisher.sender ) )
                                {
                                    if ( publisher.subscribers === null )
                                        publisher.subscribers = [ createSubscriber ( publisher.subject ) ];
                                    else
                                    {
                                        if ( publisher.subscribers.find ( findSubscriber ) === undefined )
                                            publisher.subscribers.push ( createSubscriber ( publisher.subject ) );
                                    }
                                }
                            };
    
          if ( specificMessage && specificSender ) // Case I -- A specific message by a specific sender
          {
              const publishers : Publishers | undefined = this._emitters_ [ <string> name ];
              
              if ( publishers === undefined )
                  this._emitters_ [ <string> name ] = createPublishers ();
              else
              {
                  if ( publishers.find ( findPublisher ) === undefined )
                      publishers.push ( createPublisher () );
                  else
                      publishers.forEach ( subscribe );
              }
          }
    
          if ( specificMessage && noSpecificSender ) // Case II -- A specific message by any sender
          {
              const findSubscriber = ( subscriber : Subscriber ) : boolean =>
                                     {
                                         return ( subscriber.observer === observer &&
                                                  subscriber.name     === name     &&
                                                  subscriber.handler  === notificationHandler );
                                     };
              
              if ( this._emitters_ [ <string> name ] !== undefined )
                  this._emitters_ [ <string> name ].forEach ( subscribe );
              
              if ( this._subscribersToOneByAny_.find ( findSubscriber ) === undefined )
                  this._subscribersToOneByAny_.push ( { observer : observer,
                                                         handler : notificationHandler,
                                                            name : <string> name } );
          }
          
          if ( ( noSpecificMessage && specificSender   ) || // Case III - Any message by a specific sender
               ( noSpecificMessage && noSpecificSender ) )  // Case IV -- Any message by any sender
          {
              const findSubscriber = ( subscriber : Subscriber ) : boolean =>
                                     {
                                         return ( subscriber.name         === undefined           &&
                                                  subscriber.subscription === undefined           &&
    
                                                  subscriber.observer     === observer            &&
                                                  subscriber.handler      === notificationHandler &&
    
                                                  ( subscriber.sender     === undefined           ||
                                                    subscriber.sender     === sender ) );
                                     };
    
              for ( let key in this._emitters_ )
                  this._emitters_ [ key ].forEach ( subscribe );
              
              if ( noSpecificMessage && specificSender )
                  if ( this._subscribersToAnyByOne_.find ( findSubscriber ) === undefined )
                      this._subscribersToAnyByOne_.push ( { observer : observer,
                                                              sender : sender,
                                                             handler : notificationHandler } );
              
              if ( noSpecificMessage && noSpecificSender )
                  if ( this._subscribersToAnyByAny_.find ( findSubscriber ) === undefined )
                      this._subscribersToAnyByAny_.push ( { observer : observer,
                                                             handler : notificationHandler } );
          }
      }
    
   // ========================================================================================================
      
      public postNotification ( notification : Notification ) : void;
      public postNotification ( name   : string,
                                sender : Object ) : void;
      public postNotification ( name     : string,
                                sender   : Object,
                                userInfo : UserInfo | null ) : void;
      public postNotification ( argument1 : Notification | string,
                                sender   ?: Object,
                                userInfo ?: UserInfo | null ) : void
      {
          let notification         : Notification;
          let notificationName     : string;
          let notificationSender   : Object;
          let notificationUserInfo : UserInfo | undefined | null;
          
          if ( typeof arguments [ 0 ] === "object" )
          {
              notification       = arguments [ 0 ];
              notificationName   = notification.name;
              notificationSender = notification.sender;
          }
          else
          {
              notificationName     = arguments [ 0 ];
              notificationSender   = arguments [ 1 ];
              notificationUserInfo = arguments [ 2 ];
              notification         = { name     : notificationName,
                                       sender   : notificationSender,
                                       userInfo : notificationUserInfo };
          }
          
          if ( this._subscribersToOneByAny_.length > 0 )
              this._subscribersToOneByAny_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         if ( subscriber.name === notificationName )
                                                             this.addObserver ( subscriber.observer,
                                                                                <NotificationHandler> subscriber.handler,
                                                                                notificationName,
                                                                                notificationSender );
                                                     } ) ;
          
          if ( this._subscribersToAnyByOne_.length > 0 )
              this._subscribersToAnyByOne_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         if ( subscriber.sender === notificationSender )
                                                             this.addObserver ( subscriber.observer,
                                                                                <NotificationHandler> subscriber.handler,
                                                                                notificationName,
                                                                                subscriber.sender );
                                                     } );

          if ( this._subscribersToAnyByAny_.length > 0 )
              this._subscribersToAnyByAny_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         this.addObserver ( subscriber.observer,
                                                                            <NotificationHandler> subscriber.handler,
                                                                            notificationName,
                                                                            notificationSender );
                                                     } );
          
          const findPublisher = ( publisher : Publisher ) : boolean =>
                                { return ( publisher.sender === notificationSender ); };
          
          const publishers : Publishers | undefined = this._emitters_ [ notificationName ];
          
          if ( publishers !== undefined )
          {
              const publisher : Publisher | undefined = publishers.find ( findPublisher );
    
              if ( publisher !== undefined )
              {
                  const subject : NotificationSubject = publisher.subject;
        
                  subject.next ( notification );
              }
          }
      }
      
   // ========================================================================================================
      
      public removeObserver ( observer : Object ) : void;
      public removeObserver ( observer : Object,
                              name     : string | null ) : void;
      public removeObserver ( observer : Object,
                              name     : string | null,
                              sender   : Object | null ) : void;
      public removeObserver ( observer : Object,
                              name    ?: string | null,
                              sender  ?: Object | null ) : void
      {
          const noSpecificMessage : boolean = ( name   === undefined || name   === null );
          const noSpecificSender  : boolean = ( sender === undefined || sender === null );
          const specificMessage   : boolean = ( name   !== undefined && name   !== null );
          const specificSender    : boolean = ( sender !== undefined && sender !== null );
          
          const findSubscriber = ( subscriber : Subscriber ) : boolean =>
                                 {
                                     const case1 : boolean = ( noSpecificMessage && noSpecificSender ) &&
                                                             // subscriber.name     === undefined &&
                                                             // subscriber.sender   === undefined &&
                                                             subscriber.observer === observer;
                                     
                                     const case2 : boolean = ( noSpecificMessage && specificSender ) &&
                                                             subscriber.name     === undefined &&
                                                             subscriber.sender   !== undefined &&
                                                             subscriber.sender   === sender    &&
                                                             subscriber.observer === observer;
                                     
                                     const case3 : boolean = ( specificMessage && noSpecificSender ) &&
                                                             subscriber.sender   === undefined &&
                                                             subscriber.name     !== undefined &&
                                                             subscriber.name     === name      &&
                                                             subscriber.observer === observer;
                                     
                                     const case4 : boolean = ( specificMessage && specificSender ) &&
                                                             subscriber.name     !== undefined &&
                                                             subscriber.sender   !== undefined &&
                                                             subscriber.name     === name      &&
                                                             subscriber.sender   === sender    &&
                                                             subscriber.observer === observer;
                                     
                                     return ( case1 || case2 || case3 || case4 );
                                 };
          
          const removePublisher = ( publisher : Publisher,
                                    pubIndex  : number,
                                    pubArray  : Publishers ) : void =>
                                  {
                                      const subscribers : Subscribers = publisher.subscribers;
                                      
                                      subscribers.forEach ( removeSubscriber.bind ( publisher ) );
                                      
                                      if ( subscribers.length === 0 )
                                          pubArray.splice ( pubIndex, 1 );
                                  };
          
          const removeSubscriber = ( subscriber : Subscriber,
                                     subIndex   : number,
                                     subArray   : Subscribers ) : void =>
                                   {
                                       const case1 : boolean = subscriber.observer === observer &&
                                                               // @ts-ignore
                                                               this.sender         === sender;
    
                                       const case2 : boolean = subscriber.observer === observer;
    
                                       if ( case1 || case2 )
                                       {
                                           const subscription : Subscription = <Subscription> subscriber.subscription;
                                           
                                           subscription.unsubscribe ();
                                           subArray.splice ( subIndex, 1 );
                                       }
                                   };
          
          // CASE I
          if ( noSpecificMessage && noSpecificSender )
          {
              const remove_observer = ( subscribers : Subscribers ) : void =>
                                      {
                                          let index : number = subscribers.findIndex ( findSubscriber );
                                          while ( index !== -1 )
                                          {
                                              subscribers.splice ( index, 1 );
                                              
                                              index = subscribers.findIndex ( findSubscriber );
                                          }
                                      };
              
              remove_observer ( this._subscribersToAnyByAny_ );
              remove_observer ( this._subscribersToAnyByOne_ );
              remove_observer ( this._subscribersToOneByAny_ );

              for ( let key in this._emitters_ )
              {
                  this._emitters_ [ key ].forEach ( ( publisher : Publisher,
                                                      pubIndex  : number,
                                                      pubArray  : Publishers ) : void =>
                                                    {
                                                        publisher.subscribers.forEach ( ( subscriber : Subscriber,
                                                                                          subIndex   : number,
                                                                                          subArray   : Subscribers ) : void =>
                                                                                        {
                                                                                            if ( subscriber.observer === observer )
                                                                                            {
                                                                                                const subscription : Subscription = <Subscription> subscriber.subscription;

                                                                                                subscription.unsubscribe ();
                                                                                                subArray.splice ( subIndex, 1 );
                                                                                            }
                                                                                        } );
                                                        // publisher.subscribers.forEach ( removeSubscriber );
        
                                                        if ( publisher.subscribers.length === 0 )
                                                            pubArray.splice ( pubIndex, 1 );
                                                    } );
                  
                  if ( this._emitters_ [ key ].length === 0 )
                      delete this._emitters_ [ key ];
              }
          }
          
          // CASE II
          if ( noSpecificMessage && specificSender )
          {
              let index : number = this._subscribersToAnyByOne_.findIndex ( findSubscriber );
              while ( index !== -1 )
              {
                  this._subscribersToAnyByOne_.splice ( index, 1 );
                  
                  index = this._subscribersToAnyByOne_.findIndex ( findSubscriber );
              }
              
              for ( let key in this._emitters_ )
              {
                  this._emitters_ [ key ].forEach ( ( publisher : Publisher,
                                                      pubIndex  : number,
                                                      pubArray  : Publishers ) : void =>
                                                    {
                                                        publisher.subscribers.forEach ( ( subscriber : Subscriber,
                                                                                          subIndex   : number,
                                                                                          subArray   : Subscribers ) : void =>
                                                                                        {
                                                                                            if ( ( subscriber.observer === observer ) &&
                                                                                                 ( publisher.sender    === sender   ) )
                                                                                            {
                                                                                                const subscription : Subscription = <Subscription> subscriber.subscription;

                                                                                                subscription.unsubscribe ();
                                                                                                subArray.splice ( subIndex, 1 );
                                                                                            }
                                                                                        } );
                                                        // publisher.subscribers.forEach ( removeSubscriber );
                                                        
                                                        if ( publisher.subscribers.length === 0 )
                                                            pubArray.splice ( pubIndex, 1 );
                                                    } );
                  
                  if ( this._emitters_ [ key ].length === 0 )
                      delete this._emitters_ [ key ];
              }
          }
          
          // CASE III
          if ( specificMessage && noSpecificSender )
          {
              let index = this._subscribersToOneByAny_.findIndex ( findSubscriber );
              while ( index !== -1 )
              {
                  this._subscribersToOneByAny_.splice ( index, 1 );
                  
                  index = this._subscribersToOneByAny_.findIndex ( findSubscriber );
              }
              
              const publishers : Publishers | undefined = this._emitters_ [ <string> name ];
              if ( publishers !== undefined )
              {
                  publishers.forEach ( ( publisher : Publisher,
                                         pubIndex  : number,
                                         pubArray  : Publishers ) : void =>
                                       {
                                           const subscribers : Subscribers = publisher.subscribers;
                                           
                                           subscribers.forEach ( ( subscriber : Subscriber,
                                                                   subIndex   : number,
                                                                   subArray   : Subscribers ) : void =>
                                                                 {
                                                                     if ( subscriber.observer === observer )
                                                                     {
                                                                         const subscription : Subscription = <Subscription> subscriber.subscription;
                                                                         
                                                                         subscription.unsubscribe ();
                                                                         subArray.splice ( subIndex, 1 );
                                                                     }
                                                                 } );
                                           
                                           if ( subscribers.length === 0 )
                                               pubArray.splice ( pubIndex, 1 );
                                       } );
                  
                  if ( publishers.length === 0 )
                      delete this._emitters_ [ <string> name ];
              }
          }
          
          // CASE IV
          if ( specificMessage && specificSender )
          {
              const publishers : Publishers | undefined = this._emitters_ [ <string> name ];
              if ( publishers !== undefined )
              {
                  publishers.forEach ( ( publisher : Publisher,
                                         pubIndex  : number,
                                         pubArray : Publishers ) : void =>
                                       {
                                           if ( publisher.sender === sender )
                                           {
                                               const subscribers : Subscribers = publisher.subscribers;
                                               
                                               subscribers.forEach ( ( subscriber : Subscriber,
                                                                       subIndex   : number,
                                                                       subArray   : Subscribers ) : void =>
                                                                     {
                                                                         if ( subscriber.observer === observer )
                                                                         {
                                                                             const subscription : Subscription = <Subscription> subscriber.subscription;
                                                                             
                                                                             subscription.unsubscribe ();
                                                                             subArray.splice ( subIndex, 1 );
                                                                         }
                                                                     } );
                                               
                                               if ( subscribers.length === 0 )
                                                   pubArray.splice ( pubIndex, 1 );
                                           }
                                       } );
                  
                  if ( publishers.length === 0 )
                      delete this._emitters_ [ <string> name ];
              }
          }
      }
    
   // ========================================================================================================
   
   }
   
// ***********************************************************************************************************
