package com.example.artguardmobile

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.IntentSenderRequest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.artguardmobile.data.storage.TokenStorage
import com.example.artguardmobile.data.storage.UserStorage
import com.example.artguardmobile.ui.AppNavigation
import com.example.artguardmobile.ui.login.GoogleAuthHelper
import com.example.artguardmobile.ui.theme.ArtGuardMobileTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        TokenStorage.init(applicationContext)
        UserStorage.init(applicationContext)

        setContent {
            ArtGuardMobileTheme {
                var startDestination by remember { mutableStateOf("login") }
                var isReady by remember { mutableStateOf(false) }
                val navController = rememberNavController()

                val googleLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.StartIntentSenderForResult(),
                    onResult = { result ->
                        if (result.resultCode == Activity.RESULT_OK) {
                            val data = result.data
                            if (data != null) {
                                GoogleAuthHelper.handleGoogleResult(
                                    intent = data,
                                    activity = this,
                                    onSuccess = {
                                        navController.navigate("dashboard") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    }
                                )
                            }
                        }
                    }
                )

                LaunchedEffect(Unit) {
                    val token = TokenStorage.getToken()
                    startDestination = if (!token.isNullOrBlank()) "dashboard" else "login"
                    isReady = true
                }

                if (isReady) {
                    AppNavigation(
                        navController = navController,
                        startDestination = startDestination,
                        activity = this,
                        googleLauncher = googleLauncher
                    )
                } else {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
            }
        }
    }
}









