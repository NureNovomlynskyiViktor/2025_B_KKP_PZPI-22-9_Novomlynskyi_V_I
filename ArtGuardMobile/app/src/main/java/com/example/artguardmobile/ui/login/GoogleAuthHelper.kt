package com.example.artguardmobile.ui.login

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import com.example.artguardmobile.data.network.GoogleLoginRequest
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import com.example.artguardmobile.data.storage.UserStorage
import com.example.artguardmobile.data.utils.FcmUtils
import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

object GoogleAuthHelper {
    private lateinit var oneTapClient: SignInClient
    private lateinit var signInRequest: BeginSignInRequest

    fun googleLogin(
        activity: Activity,
        launcher: ActivityResultLauncher<IntentSenderRequest>,
        onSuccess: () -> Unit
    ) {
        Log.d("GoogleAuth", "Starting googleLogin")

        oneTapClient = Identity.getSignInClient(activity)

        signInRequest = BeginSignInRequest.builder()
            .setGoogleIdTokenRequestOptions(
                BeginSignInRequest.GoogleIdTokenRequestOptions.builder()
                    .setSupported(true)
                    .setServerClientId("855874658805-k5mgio17vhdtefb1euks3feqpatj4jdr.apps.googleusercontent.com") // твій Web Client ID
                    .setFilterByAuthorizedAccounts(false)
                    .build()
            )
            .setAutoSelectEnabled(true)
            .build()

        oneTapClient.beginSignIn(signInRequest)
            .addOnSuccessListener { result ->
                Log.d("GoogleAuth", "Begin sign-in success")
                val intentRequest =
                    IntentSenderRequest.Builder(result.pendingIntent.intentSender).build()
                launcher.launch(intentRequest)
            }
            .addOnFailureListener { e ->
                Log.e("GoogleAuth", "Sign-in failed: ${e.localizedMessage}")
            }
    }

    fun handleGoogleResult(
        intent: Intent?,
        activity: Activity,
        onSuccess: () -> Unit
    ) {
        try {
            Log.d("GoogleAuth", "Handling Google result")
            val credential = Identity.getSignInClient(activity).getSignInCredentialFromIntent(intent)
            val googleIdToken = credential.googleIdToken

            if (googleIdToken.isNullOrEmpty()) {
                Log.e("GoogleAuth", "Google ID token is null or empty")
                return
            }

            // 1. Увійти в Firebase через отриманий Google ID token
            val firebaseCredential = GoogleAuthProvider.getCredential(googleIdToken, null)
            FirebaseAuth.getInstance().signInWithCredential(firebaseCredential)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        // 2. Отримати Firebase ID token
                        FirebaseAuth.getInstance().currentUser?.getIdToken(false)
                            ?.addOnSuccessListener { result ->
                                val firebaseIdToken = result.token
                                if (firebaseIdToken.isNullOrEmpty()) {
                                    Log.e("GoogleAuth", "Firebase ID token is null or empty")
                                    return@addOnSuccessListener
                                }
                                // 3. Відправити Firebase ID token на бекенд
                                CoroutineScope(Dispatchers.IO).launch {
                                    try {
                                        val response = RetrofitInstance.api.loginWithGoogle(GoogleLoginRequest(firebaseIdToken))
                                        if (response.isSuccessful) {
                                            val token = response.body()?.token
                                            if (!token.isNullOrBlank()) {
                                                TokenStorage.saveToken(token)
                                                FcmUtils.sendFcmTokenIfAvailable()
                                                val user = RetrofitInstance.userApi.getCurrentUser("Bearer $token")
                                                UserStorage.saveUser(user)
                                                withContext(Dispatchers.Main) {
                                                    onSuccess()
                                                }
                                            } else {
                                                Log.e("GoogleAuth", "Token was null or blank")
                                            }
                                        } else {
                                            Log.e("GoogleAuth", "Google login failed: ${response.code()}")
                                        }
                                    } catch (e: Exception) {
                                        Log.e("GoogleAuth", "Exception during login: ${e.localizedMessage}")
                                    }
                                }
                            }
                            ?.addOnFailureListener { e ->
                                Log.e("GoogleAuth", "Failed to get Firebase ID token: ${e.localizedMessage}")
                            }
                    } else {
                        Log.e("GoogleAuth", "Firebase sign-in failed: ${task.exception?.localizedMessage}")
                    }
                }

        } catch (e: Exception) {
            Log.e("GoogleAuth", "Failed to get credential: ${e.localizedMessage}")
        }
    }
}







