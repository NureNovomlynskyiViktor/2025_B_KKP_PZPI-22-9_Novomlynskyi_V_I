package com.example.artguardmobile.data.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.example.artguardmobile.data.model.User
import com.google.gson.Gson

object UserStorage {
    private const val PREF_NAME = "secure_user_prefs"
    private const val KEY_USER = "user_data"
    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

        prefs = EncryptedSharedPreferences.create(
            PREF_NAME,
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveUser(user: User) {
        prefs.edit().putString(KEY_USER, Gson().toJson(user)).apply()
    }

    fun getUser(): User? {
        return prefs.getString(KEY_USER, null)?.let {
            Gson().fromJson(it, User::class.java)
        }
    }

    fun clearUser() {
        prefs.edit().remove(KEY_USER).apply()
    }
}