//
//  MyClass.m
//  ReactNativeRocketChat
//
//  Created by admin on 16/6/12.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "MyClass.h"
#import "RCTNetworking.h"
#import "RCTRootView.h"
#import "RCTUIManager.h"
#import "RCTScrollView.h"
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 90000
#import <CoreSpotlight/CoreSpotlight.h>
#endif

@interface MyClass ()
@property(nonatomic, copy) RCTResponseSenderBlock responseBlock;
@property(nonatomic, strong) UIDocumentInteractionController *documentInteractionController;
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
- (void)openFileByOtherApplication:(NSString*)path
{
  UIWindow *window = [[[UIApplication sharedApplication] delegate] window];
  if(window)
  {
    UIView *view = window.rootViewController.view;
    if(view)
    {
      dispatch_async(dispatch_get_main_queue(), ^{
        NSURL *fileURL = [NSURL fileURLWithPath:path];
        self.documentInteractionController = [UIDocumentInteractionController interactionControllerWithURL:fileURL];
        self.documentInteractionController.delegate = self;
        [self.documentInteractionController presentOpenInMenuFromRect:view.bounds inView:view animated:YES];
      });
    }
  }
}
- (void)documentInteractionController:(UIDocumentInteractionController *)controller willBeginSendingToApplication:(nullable NSString *)application
{
  //NSLog(@"%s %@",__FUNCTION__,application);
}
- (void)documentInteractionController:(UIDocumentInteractionController *)controller didEndSendingToApplication:(nullable NSString *)application
{
  //NSLog(@"%@",application);
}
- (void)documentInteractionControllerDidDismissOpenInMenu:(UIDocumentInteractionController *)controller
{
  self.documentInteractionController = nil;
}
RCT_EXPORT_METHOD(loadFile:(NSDictionary*)dic:(RCTResponseSenderBlock)callback) {
  //NSLog(@"%@",dic);
  NSString *rid = [dic objectForKey:@"rid"];
  NSString *fid = [dic objectForKey:@"fid"];
  NSString *fileName = [[NSString stringWithFormat:@"%@_%@",fid,[[dic objectForKey:@"url"] lastPathComponent]] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
  NSString *path = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
  path = [path stringByAppendingPathComponent:@"LoadFiles"];
  if(![[NSFileManager defaultManager] fileExistsAtPath:path])
  {
    [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:NO attributes:nil error:nil];
  }
  path = [path stringByAppendingPathComponent:rid];
  if(![[NSFileManager defaultManager] fileExistsAtPath:path])
  {
    [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:NO attributes:nil error:nil];
  }
  path = [path stringByAppendingPathComponent:fileName];
  if([[NSFileManager defaultManager] fileExistsAtPath:path])
  {
    //path = [path stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [self openFileByOtherApplication:path];
    callback(@[[NSNull null],[NSString stringWithFormat:@"file://%@",path]]);
  }
  else
  {
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[dic objectForKey:@"url"]]];
    [request addValue:[dic objectForKey:@"token"] forHTTPHeaderField:@"Cookie"];
    [NSURLConnection sendAsynchronousRequest:request queue:[[NSOperationQueue alloc] init] completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
      if (error) {
        callback(@[@"error",[NSString stringWithFormat:@"File load failed : %@",[error localizedDescription]]]);
        return;
      }
      BOOL success = [data writeToFile:path atomically:YES];
      if(success)
      {
        if(RCT_DEBUG)
        {
          NSLog(@"%s : Write file to = %@",__FUNCTION__,path);
        }
      }
      //NSString *filePath = [path stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
      [self openFileByOtherApplication:path];
      
      callback(@[[NSNull null],[NSString stringWithFormat:@"file://%@",path]]);
    }];
  }
}
RCT_EXPORT_METHOD(saveSpotlight:(NSDictionary*)dic:(RCTResponseSenderBlock)callback) {
  //NSLog(@"%@",dic);
  if([[[UIDevice currentDevice] systemVersion] floatValue]>=9.0)
  {
    NSString *path = [dic objectForKey:@"name"];
    NSString *name = [path lastPathComponent];
    if([path rangeOfString:@"direct/"].length>0)
    {
      name = [@"@ " stringByAppendingString:name];
    }
    NSArray *array = [dic objectForKey:@"data"];
    NSMutableArray *spot = [[NSMutableArray alloc] init];
    for(int i=0;i<[array count];i++)
    {
      NSDictionary *d = [array objectAtIndex:i];
      NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
      [dic setObject:name forKey:@"name"];
      [dic setObject:[NSString stringWithFormat:@"%@_%@",[d objectForKey:@"rid"],[d objectForKey:@"_id"]] forKey:@"id"];
      NSString *content = [NSString stringWithFormat:@"%@%@",NSLocalizedString(@"author", nil),[[d objectForKey:@"u"] objectForKey:@"username"]];
      content = [content stringByAppendingFormat:@" %@%@",NSLocalizedString(@"time", nil),[d objectForKey:@"ts"]];
      content = [content stringByAppendingFormat:@" %@%@",NSLocalizedString(@"content", nil),[d objectForKey:@"msg"]];
      if([d objectForKey:@"attachments"])
      {
        NSArray *a = [d objectForKey:@"attachments"];
        NSDictionary *da = [a objectAtIndex:0];
        content = [content stringByAppendingFormat:@" %@",NSLocalizedString(@"attach", nil)];
        NSString *n=[[[da objectForKey:@"title_link"] lastPathComponent] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        content = [content stringByAppendingString:n];
      }
      [dic setObject:content forKey:@"content"];
      [spot addObject:dic];
    }
    [self saveSpotlightData:spot];
  }
}
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 90000
-(void)sendOpen:(NSString*)rid
{
  [self.bridge.eventDispatcher sendAppEventWithName:@"openRoom" body:@{@"value":rid}];
}
-(void)saveSpotlightFilePath:(NSString*)path string:(NSString*)aString
{
  NSString *name = [path lastPathComponent];
  NSData *data = nil;
  NSString *imagePath = @"";
  imagePath = [imagePath stringByAppendingPathComponent:[name stringByDeletingPathExtension]];
  imagePath = [imagePath stringByAppendingPathExtension:@"png"];
  if([[NSFileManager defaultManager] fileExistsAtPath:imagePath])
  {
    data = [NSData dataWithContentsOfFile:imagePath];
  }
  if(!data)
  {
    NSString *newPath = [[imagePath stringByDeletingPathExtension] stringByAppendingString:@"-new"];
    newPath = [newPath stringByAppendingPathExtension:@"png"];
    if([[NSFileManager defaultManager] fileExistsAtPath:newPath])
    {
      data = [NSData dataWithContentsOfFile:newPath];
    }
  }
  NSMutableDictionary *d = [NSMutableDictionary dictionaryWithObjectsAndKeys:name,@"name", nil];
  if(data)
  {
    [d setObject:data forKey:@"image"];
  }
  if(aString)
  {
    [d setObject:aString forKey:@"content"];
  }
  if(d)
  {
    [self saveSpotlightData:[NSArray arrayWithObject:d]];
  }
}
- (void)saveSpotlightData:(NSArray*)data
{
  NSString *appId = [[NSBundle mainBundle] bundleIdentifier];
  
  NSMutableArray *seachableItems = [NSMutableArray new];
  /*for(int i=0;i<[data count];i++)
   {
   NSDictionary *obj = [data objectAtIndex:i];
   CSSearchableItemAttributeSet *attributeSet = [[CSSearchableItemAttributeSet alloc] initWithItemContentType:@"views"];
   attributeSet.title = [obj objectForKey:@"name"];
   if([obj objectForKey:@"keys"]) attributeSet.keywords = [obj objectForKey:@"keys"];
   if([obj objectForKey:@"note"]) attributeSet.contentDescription = [obj objectForKey:@"note"];
   NSArray *identifiers = [NSArray arrayWithObject:[obj objectForKey:@"name"]];
   [[CSSearchableIndex defaultSearchableIndex] deleteSearchableItemsWithIdentifiers:identifiers completionHandler:^(NSError * __nullable error){
   if(!error)
   {
   CSSearchableItem *item = [[CSSearchableItem alloc] initWithUniqueIdentifier:[obj objectForKey:@"name"]                                                                                                                                                                                                                                      domainIdentifier:appId                                                                                                                                                                                  attributeSet:attributeSet];
   [seachableItems addObject:item];
   if(i == [data count]-1)
   {
   [[CSSearchableIndex defaultSearchableIndex] indexSearchableItems:seachableItems
   completionHandler:^(NSError * __nullable error) {
   if (!error)
   NSLog(@"%@",error.localizedDescription);
   }];
   }
   }
   }
   ];
   }//*/
  
  [data enumerateObjectsUsingBlock:^(NSDictionary *__nonnull obj, NSUInteger idx, BOOL * __nonnull stop) {
    CSSearchableItemAttributeSet *attributeSet = [[CSSearchableItemAttributeSet alloc] initWithItemContentType:@"views"];
    attributeSet.title = [obj objectForKey:@"name"];
    NSString *content = content = [obj objectForKey:@"content"];
    if(content)
    {
      attributeSet.contentDescription = content;
    }
     //NSLog(@"%@",content);
    if([obj objectForKey:@"image"]) attributeSet.thumbnailData = [obj objectForKey:@"image"];
    NSString *identifier = [NSString stringWithFormat:@"%@%@",appId,[obj objectForKey:@"id"]];
    NSArray *identifiers = [NSArray arrayWithObjects:identifier,[obj objectForKey:@"id"],nil];
    [[CSSearchableIndex defaultSearchableIndex] deleteSearchableItemsWithIdentifiers:identifiers completionHandler:^(NSError * __nullable error){
      if(!error)
      {
        NSLog(@"%@",[obj objectForKey:@"id"]);
        NSLog(@"%@",appId);
        CSSearchableItem *item = [[CSSearchableItem alloc] initWithUniqueIdentifier:[obj objectForKey:@"id"]                                                                                                                                                                                                                                      domainIdentifier:appId                                                                                                                                                                                  attributeSet:attributeSet];
        [seachableItems addObject:item];
      }
      if(idx == [data count] - 1)
      {
        //NSLog(@"%s %@",__FUNCTION__,seachableItems);
        [[CSSearchableIndex defaultSearchableIndex] indexSearchableItems:seachableItems
                                                       completionHandler:^(NSError * __nullable error) {
                                                         if (error)
                                                           NSLog(@"%@",error.localizedDescription);
                                                       }];
      }
    }
     ];
  }];
}
#endif
@end