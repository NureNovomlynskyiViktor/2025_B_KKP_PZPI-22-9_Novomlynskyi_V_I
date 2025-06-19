package com.example.artguardmobile.fcm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.artguardmobile.MainActivity
import com.example.artguardmobile.R
import com.example.artguardmobile.data.model.FcmTokenDto
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val title = remoteMessage.notification?.title ?: "ArtGuard"
        val body = remoteMessage.notification?.body ?: "Нове повідомлення"
        showNotification(title, body)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "🔁 Новий FCM токен: $token")

        val jwt = TokenStorage.getToken()
        Log.d("FCM", "🔐 JWT токен: $jwt")

        val fcmDto = FcmTokenDto(token)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitInstance.userApi.updateFcmToken(fcmDto, "Bearer $jwt")
                if (response.isSuccessful) {
                    Log.d("FCM", "✅ FCM токен успішно надіслано на сервер")
                } else {
                    Log.e("FCM", "❌ Сервер відповів з помилкою: ${response.code()} - ${response.message()}")
                }
            } catch (e: Exception) {
                Log.e("FCM", "🔥 Виняток при надсиланні токена", e)
            }
        }
    }

    private fun showNotification(title: String, body: String) {
        val channelId = "artguard_alerts"
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channel = NotificationChannel(
            channelId,
            "ArtGuard Сповіщення",
            NotificationManager.IMPORTANCE_HIGH
        )
        notificationManager.createNotificationChannel(channel)

        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}



