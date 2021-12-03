/*
 * ***********************************************************************************************************
 *
 * Author: Johnny Alexander Tablada-Rodriguez
 * Created On: Friday, 20 August, 2021
 * File: notification-center.service.ts
 * Project: notification-center-service
 * Notice: Copyright (c) 2021.  (R)All rights reserved.
 *
 * ***********************************************************************************************************
 */

   import { Injectable }            from '@angular/core';
   import { Subject, Subscription } from 'rxjs';

   export interface UserInfo { [ key : string ] : boolean | number | string | object }

   export interface Notification { name      : string,
                                   sender    : Object,
                                   userInfo ?: UserInfo | null }

   export type NotificationSubject = Subject <Notification>;

   export type NotificationHandler = ( notification : Notification ) => void;

   export type Sender = Object | null;

   export type Subscriber = { observer      : Object;
                              name         ?: string;
                              handler      ?: NotificationHandler;
                              sender       ?: Sender;
                              subscription ?: Subscription };

   export type Subscribers = Subscriber [];
   
   export type Publisher = { subject     : NotificationSubject;
                             sender     ?: Sender;
                             subscribers : Subscribers };
   
   export type Publishers = Publisher [];

   export interface Emitters { [ index : string ] : Publishers }

// ***********************************************************************************************************

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
       
       // public displayArrays () : void
       // {
       //     console.log ( '/'.repeat ( 80 ) );
       //     console.log ( this._subscribersToAnyByAny_ );
       //     console.log ( this._subscribersToAnyByOne_ );
       //     console.log ( this._subscribersToOneByAny_ );
       //     console.log ( this._emitters_ );
       //     console.log ( '\\'.repeat ( 80 ) );
       // }
       
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
          const noSpecificMessage : boolean = ( undefined === name   || null === name   );
          const noSpecificSender  : boolean = ( undefined === sender || null === sender );
          const specificMessage   : boolean = ( undefined !== name   && null !== name   );
          const specificSender    : boolean = ( undefined !== sender && null !== sender );
    
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
                                    if ( null === publisher.subscribers )
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
              const publishers : Publishers | undefined = this._emitters_ [ name! ];
              
              if ( undefined === publishers )
                  this._emitters_ [ name! ] = createPublishers ();
              else
              {
                  if ( undefined === publishers.find ( findPublisher ) )
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
              
              if ( undefined !== this._emitters_ [ name! ] )
                  this._emitters_ [ name! ].forEach ( subscribe );
              
              if ( undefined === this._subscribersToOneByAny_.find ( findSubscriber ) )
                  this._subscribersToOneByAny_.push ( { observer : observer,
                                                         handler : notificationHandler,
                                                            name : name! } );
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
    
              for ( const key in this._emitters_ )
                  this._emitters_ [ key ].forEach ( subscribe );
              
              if ( noSpecificMessage && specificSender )
                  if ( undefined === this._subscribersToAnyByOne_.find ( findSubscriber ) )
                      this._subscribersToAnyByOne_.push ( { observer : observer,
                                                              sender : sender,
                                                             handler : notificationHandler } );
              
              if ( noSpecificMessage && noSpecificSender )
                  if ( undefined === this._subscribersToAnyByAny_.find ( findSubscriber ) )
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
          
          if ( "object" === typeof arguments [ 0 ] )
          {
              notification       = arguments [ 0 ];
              notificationName   = notification.name;
              notificationSender = notification.sender;
          }
          else
          {
              [ notificationName,
                notificationSender,
                notificationUserInfo ] = arguments;
              notification             = { name     : notificationName,
                                           sender   : notificationSender,
                                           userInfo : notificationUserInfo };
          }
          
          if ( this._subscribersToOneByAny_.length > 0 )
              this._subscribersToOneByAny_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         if ( subscriber.name === notificationName )
                                                             this.addObserver ( subscriber.observer,
                                                                                subscriber.handler!,
                                                                                notificationName,
                                                                                notificationSender );
                                                     } ) ;
          
          if ( this._subscribersToAnyByOne_.length > 0 )
              this._subscribersToAnyByOne_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         if ( subscriber.sender === notificationSender )
                                                             this.addObserver ( subscriber.observer,
                                                                                subscriber.handler!,
                                                                                notificationName,
                                                                                subscriber.sender );
                                                     } );

          if ( this._subscribersToAnyByAny_.length > 0 )
              this._subscribersToAnyByAny_.forEach ( ( subscriber : Subscriber ) : void =>
                                                     {
                                                         this.addObserver ( subscriber.observer,
                                                                            subscriber.handler!,
                                                                            notificationName,
                                                                            notificationSender );
                                                     } );
          
          const findPublisher = ( publisher : Publisher ) : boolean =>
                                { return ( publisher.sender === notificationSender ); };
          
          const publishers : Publishers | undefined = this._emitters_ [ notificationName ];
          
          if ( undefined !== publishers )
          {
              const publisher : Publisher | undefined = publishers.find ( findPublisher );
    
              if ( undefined !== publisher )
              {
                  const { subject } = publisher;
        
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
          const noSpecificMessage : boolean = ( undefined === name   || null === name   );
          const noSpecificSender  : boolean = ( undefined === sender || null === sender );
          const specificMessage   : boolean = ( undefined !== name   && null !== name   );
          const specificSender    : boolean = ( undefined !== sender && null !== sender );
          
          const findSubscriber = ( subscriber : Subscriber ) : boolean =>
                                 {
                                     const CASE_I : boolean = ( noSpecificMessage && noSpecificSender ) &&
                                                              // subscriber.name     === undefined &&
                                                              // subscriber.sender   === undefined &&
                                                              subscriber.observer === observer;
                                     
                                     const CASE_II : boolean = ( noSpecificMessage && specificSender ) &&
                                                               subscriber.name     === undefined &&
                                                               subscriber.sender   !== undefined &&
                                                               subscriber.sender   === sender    &&
                                                               subscriber.observer === observer;
                                     
                                     const CASE_III : boolean = ( specificMessage && noSpecificSender ) &&
                                                                subscriber.sender   === undefined &&
                                                                subscriber.name     !== undefined &&
                                                                subscriber.name     === name      &&
                                                                subscriber.observer === observer;
                                     
                                     const CASE_IV : boolean = ( specificMessage && specificSender ) &&
                                                               subscriber.name     !== undefined &&
                                                               subscriber.sender   !== undefined &&
                                                               subscriber.name     === name      &&
                                                               subscriber.sender   === sender    &&
                                                               subscriber.observer === observer;
                                     
                                     return ( CASE_I || CASE_II || CASE_III || CASE_IV );
                                 };
          
          const removePublisher = ( publisher : Publisher,
                                    pubIndex  : number,
                                    pubArray  : Publishers ) : void =>
                                  {
                                      const CASE_I     : boolean = noSpecificMessage && noSpecificSender;
                                      const CASE_II    : boolean = noSpecificMessage && specificSender;
                                      const CASE_III   : boolean = specificMessage   && noSpecificSender;
                                      const CASE_IV    : boolean = specificMessage   && specificSender;
                                      const CASE_I_III : boolean = ( CASE_I  || CASE_III );
                                      const CASE_II_IV : boolean = ( CASE_II || CASE_IV  ) && publisher.sender === sender;
    
                                      if ( CASE_I_III || CASE_II_IV )
                                      {
                                          const { subscribers } = publisher;
        
                                          subscribers.forEach ( removeSubscriber );
        
                                          if ( 0 === subscribers.length )
                                              pubArray.splice ( pubIndex, 1 );
                                      }
                                  };
          
          const removeSubscriber = ( subscriber : Subscriber,
                                     subIndex   : number,
                                     subArray   : Subscribers ) : void =>
                                   {
                                       if ( subscriber.observer === observer )
                                       {
                                           const subscription : Subscription = subscriber.subscription!;
                                           
                                           subscription.unsubscribe ();
                                           subArray.splice ( subIndex, 1 );
                                       }
                                   };
          
          if ( noSpecificMessage && noSpecificSender ) // CASE I
          {
              const remove_observer = ( subscribers : Subscribers ) : void =>
                                      {
                                          let index : number = subscribers.findIndex ( findSubscriber );
                                          
                                          while ( -1 !== index )
                                          {
                                              subscribers.splice ( index, 1 );
                                              
                                              index = subscribers.findIndex ( findSubscriber );
                                          }
                                      };
              
              remove_observer ( this._subscribersToAnyByAny_ );
              remove_observer ( this._subscribersToAnyByOne_ );
              remove_observer ( this._subscribersToOneByAny_ );

              for ( const key in this._emitters_ )
              {
                  this._emitters_ [ key ].forEach ( removePublisher );
                  
                  if ( 0 === this._emitters_ [ key ].length )
                      delete this._emitters_ [ key ];
              }
          }
          
          if ( noSpecificMessage && specificSender ) // CASE II
          {
              let index : number = this._subscribersToAnyByOne_.findIndex ( findSubscriber );
              
              while ( -1 !== index )
              {
                  this._subscribersToAnyByOne_.splice ( index, 1 );
                  
                  index = this._subscribersToAnyByOne_.findIndex ( findSubscriber );
              }
              
              for ( const key in this._emitters_ )
              {
                  this._emitters_ [ key ].forEach ( removePublisher );
                  
                  if ( 0 === this._emitters_ [ key ].length )
                      delete this._emitters_ [ key ];
              }
          }
          
          if ( specificMessage && noSpecificSender ) // CASE III
          {
              let index = this._subscribersToOneByAny_.findIndex ( findSubscriber );
              
              while ( -1 !== index )
              {
                  this._subscribersToOneByAny_.splice ( index, 1 );
                  
                  index = this._subscribersToOneByAny_.findIndex ( findSubscriber );
              }
              
              if ( undefined !== name && null !== name )
              {
                  const publishers: Publishers | undefined = this._emitters_ [ name ];
    
                  if ( undefined !== publishers )
                  {
                      publishers.forEach ( removePublisher );
        
                      if ( 0 === publishers.length )
                          delete this._emitters_ [ name ];
                  }
              }
          }
          
          if ( specificMessage && specificSender ) // CASE IV
              if ( undefined !== name && null !== name )
              {
                  const publishers : Publishers | undefined = this._emitters_ [ name ];
                  
                  if ( undefined !== publishers )
                  {
                      publishers.forEach ( removePublisher );
                      
                      if ( 0 === publishers.length )
                          delete this._emitters_ [ name ];
                  }
              }
      }
    
   // ========================================================================================================
   
   }
   
// ***********************************************************************************************************
