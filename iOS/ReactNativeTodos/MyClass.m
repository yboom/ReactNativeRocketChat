//
//  MyClass.m
//  ReactNativeRocketChat
//
//  Created by admin on 16/6/12.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "MyClass.h"

@interface MyClass ()
@property(nonatomic, copy) RCTResponseSenderBlock responseBlock;
@end

@implementation MyClass
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

-(NSDictionary *)constantsToExport{
  NSString *path = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"bundle"];
  NSString *ip = nil;
  if(path)
  {
    NSDictionary  *settings = [NSDictionary dictionaryWithContentsOfFile:[path stringByAppendingPathComponent:@"Root.plist"]];
    NSArray *preferences = [settings objectForKey:@"PreferenceSpecifiers"];
    NSMutableDictionary *defaults = [[NSMutableDictionary alloc] initWithCapacity:[preferences count]];
    for(NSDictionary *dic in preferences)
    {
      NSString *key = [dic objectForKey:@"Key"];
      if(key)
      {
        [defaults setObject:[dic objectForKey:@"DefaultValue"] forKey:key];
      }
    }
    [[NSUserDefaults standardUserDefaults] registerDefaults:defaults];
  }
  if(!ip)
  {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    ip = [defaults stringForKey:@"ip_preference"];
    if(!ip||ip.length==0)
    {
      ip = @"10.0.0.78";
    }
  }
  return @{@"address":ip};
}

RCT_EXPORT_METHOD(filePath:(NSString*)url:(RCTResponseSenderBlock)callback){
  if(RCT_DEBUG)
  {
    NSLog(@"%s %@",__FUNCTION__,url);
  }
  NSString *document = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
  NSString *fileName = RCTMD5Hash(url);
  NSString* path = [[document stringByAppendingPathComponent:@"LoadImages"] stringByAppendingPathComponent:fileName];
  if([[NSFileManager defaultManager] fileExistsAtPath:path])
  {
    callback(@[[NSNull null],[@"file://" stringByAppendingString:path]]);
  }
  else
  {
    callback(@[[NSNull null],@""]);
  }
}
RCT_EXPORT_METHOD(saveImage:(NSString*)url:(RCTResponseSenderBlock)callback){
  NSString *fileName = RCTMD5Hash(url);
  NSString *path = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
  path = [path stringByAppendingPathComponent:@"LoadImages"];
  path = [path stringByAppendingPathComponent:fileName];
  if([[NSFileManager defaultManager] fileExistsAtPath:path])
  {
    NSData *data = [NSData dataWithContentsOfFile:path];
    if (data) {
      UIImage *image =[UIImage imageWithData:data];
      self->_responseBlock = callback;
      UIImageWriteToSavedPhotosAlbum(image, self, @selector(image:didFinishSavingWithError:contextInfo:), nil);
    }
    else
    {
      callback(@[@"error",[NSNumber numberWithInt:0]]);
    }
  }
  else
  {
    callback(@[@"error",[NSNumber numberWithInt:0]]);
  }
}
- (void)image:(UIImage *)image didFinishSavingWithError:(NSError *)error contextInfo:(void *)contextInfo
{
  if(!error)
  {
    self->_responseBlock(@[[NSNull null],[NSNumber numberWithInt:1]]);
  }
  else
  {
    self->_responseBlock(@[error.localizedDescription,[NSNumber numberWithInt:0]]);
  }
}
RCT_EXPORT_METHOD(pasteBoard:(NSString*)aString:(RCTResponseSenderBlock)callback){
  [[UIPasteboard generalPasteboard] setPersistent:YES];
  [[UIPasteboard generalPasteboard] setValue:aString forPasteboardType:[UIPasteboardTypeListString objectAtIndex:0]];
  callback(@[[NSNull null],[NSNumber numberWithInt:1]]);
  [self.bridge.eventDispatcher sendAppEventWithName:@"pasteBoard" body:@{@"value":aString}];
}
RCT_EXPORT_METHOD(reloadWebByHTML:(NSString*)message){
  [[NSNotificationCenter defaultCenter] postNotificationName:@"jsModifyHTMLBody" object:message];
}
@end