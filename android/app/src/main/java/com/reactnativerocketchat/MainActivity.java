package com.reactnativerocketchat;

import android.content.Intent;
import android.net.Uri;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.image.zoom.ReactImageZoom;
import android.app.Notification;
import android.os.Bundle;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReactNativeRocketChat";
    }
    //react-native bundle --entry-file index.android.js --bundle-output ./android/app/src/main/assets/index.android.bundle --platform android --assets-dest ./android/app/src/main/res --dev false
    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),new MyClassPackage(),new ReactImageZoom()
        );
    }

    private class MyClassPackage implements ReactPackage{
        @Override
        public List<ViewManager> createViewManagers(ReactApplicationContext reactContext){
            return new ArrayList<>();
        }
        @Override
        public List<Class<? extends JavaScriptModule>> createJSModules()
        {
            return new ArrayList<>();
        }
        @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext context){
            List<NativeModule> modules = new ArrayList<>();
            modules.add(new MyClass(context));
            return modules;
        }
    }

    private class MyClass extends ReactContextBaseJavaModule{

        public MyClass(ReactApplicationContext reactContextBaseJavaModule) {
            super(reactContextBaseJavaModule);
        }

        @Override
        public String getName()
        {
            return "MyClass";
        }
        @ReactMethod
        public void reloadWebByHTML(String message){
            System.out.println(message);
            //Intent intent = new Intent();
            //intent.setClass(MainActivity.this, ReactWebViewManager.class);

            //Bundle bundle = new Bundle();
            //bundle.putString("html",message);
            //intent.putExtras(bundle);

            //startActivity(intent);
        }
        @ReactMethod
        public  void open(String url){
            Uri uri = Uri.parse(url);
            Intent intent = new Intent(Intent.ACTION_VIEW,uri);
            startActivity(intent);
        }
    }
}

