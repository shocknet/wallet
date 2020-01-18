package com.shockwallet;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
//import androidx.core.app.NotificationCompat;
import android.support.v4.app.NotificationCompat;
//import androidx.core.app.NotificationManagerCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import 	android.util.Log;
import javax.net.ssl.HttpsURLConnection;
import 	java.io.InputStream;
import 	android.util.Log;
import 	java.net.URL;
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

import org.json.JSONObject;
import org.json.JSONArray;
import android.graphics.BitmapFactory;
public class NotificationService extends Service {

    private static int SERVICE_NOTIFICATION_ID = 12345;
    private static final String GROUP_KEY_NOTIF = "GROUP_KEY_NOTIF";
    private static final String CHANNEL_ID = "shock_notif";
    private static final String TAG = "NotificationsDeb";
    //private OkHttpClient client;
    private Handler handler = new Handler();
    private static String ip;
    private static String token;
    private Socket mSocket;
    private boolean chatInit = false;
    private Emitter.Listener newTransaction = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d(TAG,args[0].toString());
            try{
                JSONObject res = new JSONObject(args[0].toString());
            
                doNotification("New Transaction",res.getString("msg"),R.drawable.bolt);
            }catch (Exception e){
                Log.d(TAG,e.toString());
            }
        }
    };
    private Emitter.Listener newInvoice = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d(TAG,args[0].toString());
            try{
                JSONObject res = new JSONObject(args[0].toString());
                
                doNotification("New Invoice",res.getString("msg"),R.drawable.bolt);
            }catch (Exception e){
                Log.d(TAG,e.toString());
            }
        }
    };
    private Emitter.Listener newChat = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d(TAG,args[0].toString());
            if(chatInit == false){
                chatInit = true;
                return;
            }
            try{
                JSONObject res = new JSONObject(args[0].toString());
                JSONArray data = res.getJSONArray("msg");
                String latestSender = "New Message:";
                String latestBody = "You received a private message.";
                Boolean isMe=false;
                long latestTimestamp = 0;
                for(int i =0 ; i<data.length();i++){
                    JSONObject messages = data.optJSONObject(i);
                    JSONArray mexArr = messages.getJSONArray("messages");
                    for(int j=0; j<mexArr.length();j++){
                        JSONObject message = mexArr.optJSONObject(j);
                        long timestamp = message.getLong("timestamp");
                        Log.d(TAG,timestamp + "  |  "+latestTimestamp);
                        if(timestamp > latestTimestamp){
                            latestSender = messages.getString("recipientDisplayName");
                            latestBody = message.getString("body");
                            isMe = message.getBoolean("outgoing");
                            Log.d(TAG,latestSender+"  |  "+latestBody+"  |  "+isMe);
                            
                            latestTimestamp = timestamp;
                        }
                    }
                }
                if(!isMe){
                    doNotification(latestSender,latestBody,R.drawable.user);
                }
            }catch (Exception e){
                Log.d(TAG,e.toString());
            }
        }
    };
    private void attemptSend() {
        String message = "{\"token\":\""+NotificationService.token+"\"}";
    
        mSocket.emit("ON_TRANSACTION", message);
        mSocket.emit("ON_INVOICE", message);
        mSocket.emit("ON_CHATS", message);
    }
    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            Log.d(TAG,"yeahhhh");
            Log.d(TAG,"Token from run "+token);
            try {
                mSocket = IO.socket("http://"+NotificationService.ip);
                mSocket.on("ON_TRANSACTION", newTransaction);
                mSocket.on("ON_INVOICE", newInvoice);
                mSocket.on("ON_CHATS", newChat);
                mSocket.connect();
                attemptSend();
                Log.d(TAG, "Done conn");
            } catch (Exception e) {
                Log.d(TAG,e.toString());
            }
        }
    };
    private void doNotification(String title,String result,int bigIcon){
        int importance = NotificationManager.IMPORTANCE_DEFAULT;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Shock_notify", importance);
        channel.setDescription("CHANEL DESCRIPTION");
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.bolt)
                .setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                        bigIcon))
                .setContentTitle(title)
                .setContentText(result)
                //.setSmallIcon(R.drawable.bolt)
                .setContentIntent(contentIntent)
                .setGroup(GROUP_KEY_NOTIF);
        
        NotificationManagerCompat notificationManager1 = NotificationManagerCompat.from(this);
        notificationManager1.notify(++SERVICE_NOTIFICATION_ID, notification.build());
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
        mSocket.off("ON_TRANSACTION", newTransaction);
        mSocket.off("ON_INVOICE", newInvoice);
        mSocket.off("ON_CHATS", newChat);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        
        Bundle bundle = intent.getExtras();
        if(bundle != null){
            String token = (String) bundle.get("token");
            String ip = (String) bundle.get("ip");
            Log.d(TAG, "ip: "+ip + " token: "+token);
            NotificationService.token = token;
            NotificationService.ip = ip;
        }
        
        int importance = NotificationManager.IMPORTANCE_DEFAULT;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "TEST4", importance);
        channel.setDescription("CHANEL DESCRIPTION");
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.bolt)
                .setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                        R.drawable.bolt))
                .setContentTitle("Notification service connected.")
                .setContentText("Listening...")
                //.setSmallIcon(R.drawable.bolt)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .setGroup(GROUP_KEY_NOTIF)
                .setGroupSummary(true);
        //notificationManager.notify(SERVICE_NOTIFICATION_ID, notification.build());
        startForeground(SERVICE_NOTIFICATION_ID, notification.build());
        return START_STICKY;
    };
}
