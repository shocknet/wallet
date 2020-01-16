package com.shockwallet;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.zoontek.rnbootsplash.RNBootSplashPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.BV.LinearGradient.LinearGradientPackage;
import org.reactnative.camera.RNCameraPackage;
import com.horcrux.svg.SvgPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.shockwallet.NotificationPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new PickerPackage(),
            new RNSensitiveInfoPackage(),
            new NetInfoPackage(),
            new RNBootSplashPackage(),
            new LinearGradientPackage(),
            new AsyncStoragePackage(),
            new RNCameraPackage(),
            new SvgPackage(),
            new NotificationPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
