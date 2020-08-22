package com.shockwallet;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
// import android.support.v4.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
// import android.support.v4.app.NotificationManagerCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import 	android.util.Log;
import javax.net.ssl.HttpsURLConnection;
import 	java.io.InputStream;
import 	android.util.Log;
import 	java.net.URL;
import java.util.HashMap;
import java.util.Map;
import 	java.io.BufferedInputStream;
import java.net.MalformedURLException;
import 	java.io.IOException;
import android.os.AsyncTask;
import com.facebook.react.HeadlessJsTaskService;
//import okhttp3.OkHttpClient;
//import okhttp3.Request;
//import okhttp3.Response;
//import okhttp3.WebSocket;
//import okhttp3.WebSocketListener;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.github.nkzawa.emitter.Emitter;

//import okio.ByteString;
import android.os.Bundle;
import 	android.util.Base64;
import java.security.SecureRandom;
import javax.crypto.spec.IvParameterSpec;


import org.json.JSONObject;
import org.json.JSONArray;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import com.shockwallet.RSA;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;
import com.squareup.okhttp.Callback;
import com.squareup.okhttp.Call;
import com.squareup.okhttp.Response;
public class NotificationService extends Service {
    private enum ReqTypeEnum {
        ExchangeKeys
    }
    private NotificationCompat.Builder nBuilder;
    private NotificationCompat.Builder silentNBuilder;
    private NotificationManager nManager;
    private static final int INITIAL_SERVICE_NOTIFICATION_ID = 12345;
    private static int SERVICE_NOTIFICATION_ID = INITIAL_SERVICE_NOTIFICATION_ID;
    private static final String GROUP_KEY_NOTIF = "GROUP_KEY_NOTIF";
    //private static final String CHANNEL_ID = "shock_notif";
    private static final String DEFAULT_CHANNEL_ID = "shockwallet.notifications.default";
    private static final String LOW_CHANNEL_ID = "shockwallet.notifications.low";
    private static final String TAG = "NotificationsDeb";
    private static String ApiPubKey;
    private static String deviceId;
    //private OkHttpClient client;
    private Handler handler = new Handler();
    private static String ip;
    private static String token;
    private static boolean notifyDisconnect;
    private static int notifyDisconnectAfterMs;
    private Socket mSocket;
    private boolean chatInit = false;
    private RSA rsa;
    private boolean isReconnecting = false;
    

    private Emitter.Listener newTransaction = new Emitter.Listener() {
        private String lastTX = "";
        @Override
        public void call(final Object... args) {
            try{
                String mex = DecryptMessage(args[0].toString());
                Log.d(TAG,mex);
                JSONObject res = new JSONObject(mex);
                String last = res.getString("tx_hash");
                int confirmations =  res.getInt("num_confirmations");
                Log.d(TAG,last == lastTX ? "true" : "false");
                if(last.equals(lastTX) || confirmations == 0){
                    return;
                }
                lastTX = last;
                String id = last.substring(0,5)+"...";
                doNotification("New Transaction","value: "+res.getString("amount")+"\nTx: "+last,R.drawable.icon,"");
            }catch (Exception e){
                Log.d(TAG,"Tx err"+e.toString());
            }
        }
    };
    private Emitter.Listener newInvoice = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            
            try{
                String mex = DecryptMessage(args[0].toString());
                Log.d(TAG,mex);
                JSONObject res = new JSONObject(mex);
                boolean settled = res.getBoolean("settled");
                if(!settled){
                    return;
                }
                
                doNotification("New Invoice","value: "+res.getString("value"),R.drawable.icon,"");
            }catch (Exception e){
                Log.d(TAG,"Inv err"+e.toString());
            }
        }
    };
    private Emitter.Listener newChat = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            
            if(chatInit == false){
                chatInit = true;
                return;
            }
            try{
                String mex = DecryptMessage(args[0].toString());
                Log.d(TAG,mex);
                JSONObject res = new JSONObject(mex);
                JSONArray data = res.getJSONArray("msg");
                String latestSender = "New Message:";
                String latestBody = "You received a private message.";
                String latestAvatar = "";
                Boolean isMe=false;
                long latestTimestamp = 0;
                for(int i =0 ; i<data.length();i++){
                    JSONObject messages = data.optJSONObject(i);
                    JSONArray mexArr = messages.getJSONArray("messages");
                    for(int j=0; j<mexArr.length();j++){
                        JSONObject message = mexArr.optJSONObject(j);
                        long timestamp = message.getLong("timestamp");
                        //Log.d(TAG,messages.getString("recipientAvatar"));
                        if(timestamp > latestTimestamp){
                            latestSender = messages.getString("recipientDisplayName");
                            latestAvatar = messages.getString("recipientAvatar");
                            latestBody = message.getString("body");
                            isMe = message.getBoolean("outgoing");
                            Log.d(TAG,latestSender+"  |  "+latestBody+"  |  "+isMe);
                            
                            latestTimestamp = timestamp;
                        }
                    }
                }
                if(!isMe){
                    if(latestBody.equals("$$__SHOCKWALLET__INITIAL__MESSAGE")){
                        latestBody = "Chat initialized";
                    }
                    if(latestBody.startsWith("$$__SHOCKWALLET__INVOICE__")){
                        latestBody = "Sent and invoice";
                    }
                    doNotification(latestSender,latestBody,R.drawable.user,latestAvatar);
                }
            }catch (Exception e){
                Log.d(TAG,"Cha err"+e.toString());
            }
        }
    };
    private Emitter.Listener onConnect = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d(TAG,"CONNECTED SOCKET");
            isReconnecting = false;
            silentNBuilder.setContentTitle("Notification service connected")
                .setContentText("Listening...");
            updateFixedNotification(silentNBuilder);
        }
    };
    private Emitter.Listener onDisconnect = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d(TAG,"DISCONNECTED SOCKET");
            isReconnecting = true;
            handler.postDelayed(new Runnable() {
                public void run() {
                    if(isReconnecting){
                        if(NotificationService.notifyDisconnect){
                            nBuilder.setContentTitle("Notification service reconnecting")
                                .setContentText("reconnecting...");
                            updateFixedNotification(nBuilder);
                        } else {
                            silentNBuilder.setContentTitle("Notification service reconnecting")
                                .setContentText("reconnecting...");
                            updateFixedNotification(silentNBuilder);
                        }
                        
                    }
                }
            }, NotificationService.notifyDisconnectAfterMs);
        }
    };
    private void updateFixedNotification(NotificationCompat.Builder builder){
        nManager.notify(INITIAL_SERVICE_NOTIFICATION_ID, builder.build());
    }

    private void attemptSend() {
        String message = "{\"token\":\""+NotificationService.token+"\"}";
        try{
            HashMap<String,String>encMex = EncryptMessage(message);
            JSONObject jsonMex = new JSONObject(encMex);
            String stringMex = jsonMex.toString();
            
            mSocket.emit("transaction:new", stringMex);
            mSocket.emit("invoice:new", stringMex);
            mSocket.emit("ON_CHATS", stringMex);
        } catch(Exception e){
            Log.d(TAG,e.toString());
        }
        //encMex.put("token", NotificationService.token.getBytes());
    }
    private void ExchangeKeys() throws Exception{
        Log.d(TAG,"exchanging keys");
        createDeviceId();
        rsa = new RSA("shocknet.tag.cc."+deviceId);
        
        rsa.generate(2048);
        String rsaPub = rsa.getPublicKey();
        //String deviceId = "7601a723-b6d4-4020-95a6-6113fb40e2f8";
        //Log.d(TAG,rsaPub);
        HashMap<String,String> rawData = new HashMap<String,String>();
        rawData.put("publicKey",rsaPub);
        rawData.put("deviceId",deviceId);
        JSONObject postdata = new JSONObject(rawData);
        postRequest("http://"+ip+"/api/security/exchangeKeys", postdata);
    }
    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            Log.d(TAG,"yeahhhh");
            //Log.d(TAG,"Token from run "+token);
            try{
                ExchangeKeys();
            } catch (Exception e) {
                Log.d(TAG,e.toString());
            }
        }
    };
    private void doNotification(String title,String result,int bigIcon, String icon64){
        /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Shock_notify", importance);
            channel.setDescription("CHANEL DESCRIPTION");
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }*/
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, DEFAULT_CHANNEL_ID)
                .setSmallIcon(R.drawable.icon)
                //.setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                //        bigIcon))
                .setContentTitle(title)
                .setContentText(result)
                //.setSmallIcon(R.drawable.icon)
                .setContentIntent(contentIntent)
                .setGroup(GROUP_KEY_NOTIF);
        if(icon64.equals("")){
            notification.setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                    bigIcon));
        } else {
            byte[] decodedString = Base64.decode(icon64, Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            notification.setLargeIcon(decodedByte);
        }
        
        nManager.notify(++SERVICE_NOTIFICATION_ID, notification.build());
    }
    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        
        this.handler.post(this.runnableCode);

    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        this.handler.removeCallbacks(this.runnableCode);
        mSocket.disconnect();
        mSocket.off("transaction:new", newTransaction);
        mSocket.off("invoice:new", newInvoice);
        mSocket.off("ON_CHATS", newChat);
    }
    

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        
        Bundle bundle = intent.getExtras();
        if(bundle != null){
            String token = (String) bundle.get("token");
            String ip = (String) bundle.get("ip");
            boolean notifyDisconnect = (boolean) bundle.get("notifyDisconnect");
            int notifyDisconnectAfterMs = (int) bundle.get("notifyDisconnectAfterMs");
            //Log.d(TAG, "ip: "+ip + " token: "+token);
            //Log.d(TAG," token: "+NotificationService.token);
            Log.d(TAG, "notify: "+notifyDisconnect + " after: "+notifyDisconnectAfterMs);
            if(NotificationService.token != null && !NotificationService.token.equals(token)){
                try{
                    mSocket.disconnect();
                    ExchangeKeys();
                } catch (Exception e) {
                    Log.d(TAG,e.toString());
                }
            }
            NotificationService.token = token;
            NotificationService.ip = ip;
            NotificationService.notifyDisconnect = notifyDisconnect;
            NotificationService.notifyDisconnectAfterMs = notifyDisconnectAfterMs;

        }
            

        
        int importanceDefault = NotificationManager.IMPORTANCE_DEFAULT;
        int importanceLow = NotificationManager.IMPORTANCE_LOW;
        //NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "ShockWalletNotificationsChannel", importance);
        //channel.setDescription("Listen on updates from ShockAPI, and push notification to the user");
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        NotificationChannel defaultChannel =  new NotificationChannel(DEFAULT_CHANNEL_ID, "ShockWalletNotifications", importanceDefault);
        defaultChannel.setDescription("Listen on updates from ShockAPI, and push notification to the user");
        NotificationChannel lowChannel =  new NotificationChannel(LOW_CHANNEL_ID, "ShockWalletSilentNotifications", importanceLow);
        defaultChannel.setDescription("Silently update the fixed notification connection status");
        notificationManager.createNotificationChannel(defaultChannel);
        notificationManager.createNotificationChannel(lowChannel);
        nManager = notificationManager;
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, DEFAULT_CHANNEL_ID)
                .setSmallIcon(R.drawable.icon)
                .setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                        R.drawable.icon))
                .setContentTitle("Notification service loading")
                .setContentText("Connecting...")
                //.setSmallIcon(R.drawable.icon)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .setGroup(GROUP_KEY_NOTIF)
                .setGroupSummary(true);
        NotificationCompat.Builder silentNotification = new NotificationCompat.Builder(this, LOW_CHANNEL_ID)
                .setSmallIcon(R.drawable.icon)
                .setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                        R.drawable.icon))
                .setContentTitle("Notification service loading")
                .setContentText("Connecting...")
                //.setSmallIcon(R.drawable.icon)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .setGroup(GROUP_KEY_NOTIF)
                .setGroupSummary(true);
        //notificationManager.notify(SERVICE_NOTIFICATION_ID, notification.build());
        startForeground(INITIAL_SERVICE_NOTIFICATION_ID, silentNotification.build());
        this.silentNBuilder = silentNotification;
        this.nBuilder = notification;
        return START_STICKY;
    };
    private HashMap<String,String> EncryptMessage(String message) throws Exception{
        byte[] plaintext = message.getBytes();
        KeyGenerator keygen = KeyGenerator.getInstance("AES");
        keygen.init(256);
        SecretKey key = keygen.generateKey();
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] ciphertext = cipher.doFinal(plaintext);
        byte[] iv = cipher.getIV();
        HashMap<String,String> encoded = new HashMap<>();
        encoded.put("encryptedData",Base64.encodeToString(ciphertext,Base64.DEFAULT));
        encoded.put("iv",bytesToHex(iv));

        //encoded.put("iv",Base64.encodeToString(iv,Base64.DEFAULT));
        String encryptedKey = EncryptKey(key);
        encoded.put("encryptedKey",encryptedKey);
        //Log.d(TAG,encoded.toString());
        return encoded;
        
    }
    private String EncryptKey(SecretKey key) throws Exception{
        String keyS = bytesToHex(key.getEncoded());
        //Log.d(TAG,Integer.toString(key.getEncoded().length));
        //Log.d(TAG,keyS);
        return this.rsa.encrypt(keyS,ApiPubKey);
    }
    private String DecryptMessage(String response) throws Exception{
        JSONObject resJ = new JSONObject(response);
        //if encryption is disabled "encryptedKey" will be empty so no need to decrypt
        if(!resJ.has("encryptedKey")){
            return response;
        }
        String encryptedKey = resJ.getString("encryptedKey");
        String iv = resJ.getString("iv");
        String cipherText = resJ.getString("encryptedData");
        String keyS = rsa.decrypt(encryptedKey);
        byte[] keyB = hexToBytes(keyS);
        SecretKeySpec secretKeySpec = new SecretKeySpec(keyB, "AES");

        byte[] ivB = hexToBytes(iv);
        final Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(ivB));
        byte[] textDecoded = Base64.decode(cipherText.getBytes(),Base64.DEFAULT);
        byte[] plainText= cipher.doFinal(textDecoded);
        return new String(plainText);


    }

    public void postRequest(String url,JSONObject postdata) throws IOException {

        MediaType MEDIA_TYPE = MediaType.parse("application/json");

        OkHttpClient client = new OkHttpClient();

        RequestBody body = RequestBody.create(MEDIA_TYPE, postdata.toString());

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("authorization", this.token)
                .build();
        
        client.newCall(request).enqueue(new com.squareup.okhttp.Callback() {
            @Override
            public void onFailure(Request req, IOException e) {
                String mMessage = e.getMessage().toString();
                Log.w("failure Response", mMessage);
                //call.cancel();
            }

            @Override
            public void onResponse( Response response) throws IOException {

                String mMessage = response.body().string();
                
                try {
                    JSONObject resJson = new JSONObject(mMessage);
                    Boolean success = resJson.getBoolean("success");
                    if(success) {
                        NotificationService.ApiPubKey = resJson.getString("APIPublicKey");

                        //mSocket = IO.socket("http://"+NotificationService.ip+"?x-shockwallet-device-id=7601a723-b6d4-4020-95a6-6113fb40e2f8");
                        mSocket = IO.socket("http://"+NotificationService.ip+"?x-shockwallet-device-id="+deviceId+"&IS_LND_SOCKET=true");
                        mSocket.on("transaction:new", newTransaction);
                        mSocket.on("invoice:new", newInvoice);
                        mSocket.on("ON_CHATS", newChat);
                        mSocket.on("connect",onConnect);
                        mSocket.on("disconnect",onDisconnect);
                        mSocket.connect();
                        attemptSend();
                        Log.d(TAG, "Done conn");
                    }
                } catch (Exception e) {
                    Log.d(TAG,e.toString());
                }
                //Log.e(TAG, mMessage);
            }
        });
    }
    private void createDeviceId(){
        byte[] p1 = new byte[4];
        byte[] p2 = new byte[2];
        byte[] p3 = new byte[1];
        byte[] p4 = new byte[1];
        byte[] p5 = new byte[6];
        SecureRandom sc = new SecureRandom();
        sc.nextBytes(p1);
        sc.nextBytes(p2);
        sc.nextBytes(p3);
        sc.nextBytes(p4);
        sc.nextBytes(p5);
        String p1s = bytesToHex(p1);
        String p2s = bytesToHex(p2);
        String p3s = bytesToHex(p3);
        String p4s = bytesToHex(p4);
        String p5s = bytesToHex(p5);
        String res = p1s + "-" + p2s + "-40" + p3s +"-95" + p4s + "-" + p5s;
        Log.d(TAG,res);
        NotificationService.deviceId =  res;

    }

    private static String bytesToHex(byte[] hashInBytes) {

        StringBuilder sb = new StringBuilder();
        for (byte b : hashInBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();

    }

    

    private static byte[] hexToBytes(String str){
      byte[] val = new byte[str.length() / 2];
      for (int i = 0; i < val.length; i++) {
         int index = i * 2;
         int j = Integer.parseInt(str.substring(index, index + 2), 16);
         val[i] = (byte) j;
      }
      return val;
    }
}
