package com.example.artguardmobile.data.utils

import android.util.Log
import com.example.artguardmobile.data.model.FcmTokenDto
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object FcmUtils {
    fun sendFcmTokenIfAvailable() {
        val jwt = TokenStorage.getToken()
        if (jwt.isNullOrBlank()) {
            Log.w("FCM", "⚠️ JWT немає, токен не відправлено")
            return
        }

        FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
            Log.d("FCM", "💡 Отримано FCM токен: $token")

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = RetrofitInstance.userApi.updateFcmToken(
                        FcmTokenDto(token),
                        "Bearer $jwt"
                    )
                    if (response.isSuccessful) {
                        Log.d("FCM", "✅ FCM токен успішно надіслано")
                    } else {
                        Log.e("FCM", "❌ ${response.code()} ${response.message()}")
                    }
                } catch (e: Exception) {
                    Log.e("FCM", "🔥 Помилка при надсиланні токена", e)
                }
            }
        }
    }
}

