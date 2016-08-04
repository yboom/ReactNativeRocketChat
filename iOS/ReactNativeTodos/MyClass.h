//
//  Header.h
//  ReactNativeRocketChat
//
//  Created by admin on 16/6/12.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "RCTBridgeModule.h"
#import "RCTUtils.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTURLRequestHandler.h"

@interface MyClass : NSObject<RCTBridgeModule,UIDocumentInteractionControllerDelegate>
-(void)sendOpen:(NSString*)rid;
@end