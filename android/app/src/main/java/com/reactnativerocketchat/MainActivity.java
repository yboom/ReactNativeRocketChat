package com.reactnativerocketchat;

import android.content.Intent;
import android.net.Uri;
import javax.annotation.Nullable;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.nio.charset.Charset;
import java.net.URL;
import java.net.MalformedURLException;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.image.zoom.ReactImageZoom;
import com.imagepicker.ImagePickerPackage;
import com.yoloci.fileupload.FileUploadPackage;

import android.app.Notification;
import android.os.Bundle;
import android.os.Environment;

import java.io.IOException;
import java.lang.reflect.Array;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Dictionary;
import java.util.List;
import java.util.Map;

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
            new MainReactPackage(),new MyClassPackage(),new ReactImageZoom(),new ImagePickerPackage(),new FileUploadPackage()
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
        String url="",token="",fid="",rid="",filePath="";
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
        public String address(){
            return "10.0.0.78";
        }
        @ReactMethod
        public  void open(String url){
            Uri uri = Uri.parse(url);
            Intent intent = new Intent(Intent.ACTION_VIEW,uri);
            startActivity(intent);
        }

        public File createSDFile(String filePath)
        {
            File file = new File(filePath);
            try
            {
                file.createNewFile();
            }catch (IOException e){
                e.printStackTrace();
            }
            return file;
        }
        public boolean isFileExist(String filePath)
        {
            File file = new File(filePath);
            return file.exists();
        }

        @ReactMethod
        public  void loadFile(String url, String token, String rid, String fid, Callback callback)
        {
            this.url = url;
            this.token = token;
            this.fid = fid;
            this.rid = rid;
            File dir = new File(Environment.getExternalStorageDirectory()+""+"/RocketNative");
            if(!dir.exists())
            {
                dir.mkdir();
            }
            dir = new File(dir+"/"+rid);
            if(!dir.exists())
            {
                dir.mkdir();
            }
            String[] array = url.split("/");
            String last = array[array.length-1];
            String fileName = URLDecoder.decode(last);
            fileName = fid+"_"+fileName;
            String filePath = dir+"/"+fileName;
            boolean exist = this.isFileExist(filePath);
            if(exist)
            {
                File file = new File(filePath);
                Uri uri = Uri.fromFile(file);
                Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                startActivity(intent);
            }
            else {
                this.filePath = filePath;
                callback.invoke("Downloading files");
            }
        }
        @ReactMethod
        public void beginFile(Callback callback)
        {
            BufferedInputStream inputStream = null;
            BufferedOutputStream outputStream = null;
            File file = null;
            try {
                URL urlconnect = new  URL(this.url+this.token);
                HttpURLConnection urlConnection = (HttpURLConnection) urlconnect.openConnection();
                urlConnection.connect();
                inputStream = new BufferedInputStream(urlConnection.getInputStream());
                file = this.createSDFile(this.filePath);
                outputStream = new BufferedOutputStream(new FileOutputStream(file));
                int length = 2048;
                byte buffer[] = new byte[length];
                while ((length=inputStream.read(buffer)) != -1)
                {
                    outputStream.write(buffer,0,length);
                }
                outputStream.flush();
                inputStream.close();
                urlConnection.disconnect();
            }catch (MalformedURLException e){
                e.printStackTrace();
                callback.invoke(e.getLocalizedMessage());
            }catch (IOException e){
                e.printStackTrace();
                callback.invoke(e.getLocalizedMessage());
            }finally {
                try
                {
                    inputStream.close();
                    outputStream.close();
                    if(file == null)
                    {
                        callback.invoke("Download file error!");
                    }
                    else
                    {
                        callback.invoke("File download successfully.");
                        Uri uri = Uri.fromFile(file);
                        Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                        startActivity(intent);
                    }
                }catch (IOException e){
                    e.printStackTrace();
                    callback.invoke(e.getLocalizedMessage());
                }
            }
        }
    }
}

