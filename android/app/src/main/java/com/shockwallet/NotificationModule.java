package com.shockwallet;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import 	android.util.Log;
import android.os.Bundle;

import javax.annotation.Nonnull;
import com.shockwallet.NotificationService;


public class NotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationsDeb";
    public static final String REACT_CLASS = "notificationService";
    private static ReactApplicationContext reactContext;

    public NotificationModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startService(String ip,String token) {
        Intent service = new Intent(this.reactContext, NotificationService.class);
        Bundle bundle = new Bundle();

        bundle.putString("ip", ip);
        bundle.putString("token", token);
        service.putExtras(bundle);
        this.reactContext.startService(service);
    }

    @ReactMethod
    public void stopService() {
        this.reactContext.stopService(new Intent(this.reactContext, NotificationService.class));
        Log.d(TAG,"stopping service");
    }
}
