package com.example.artguardmobile.ui.login

import android.app.Activity
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.artguardmobile.data.network.LoginRequest
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import com.example.artguardmobile.data.storage.UserStorage
import com.example.artguardmobile.data.utils.FcmUtils
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    navController: NavController,
    googleLauncher: ActivityResultLauncher<IntentSenderRequest>,
    activity: Activity
) {
    val scope = rememberCoroutineScope()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Вхід", style = MaterialTheme.typography.headlineSmall)

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    placeholder = { Text("example@email.com") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Пароль") },
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                error?.let {
                    Text(it, color = MaterialTheme.colorScheme.error)
                }

                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            try {
                                val response = RetrofitInstance.api.login(LoginRequest(email, password))
                                if (response.isSuccessful) {
                                    val token = response.body()?.token
                                    if (!token.isNullOrBlank()) {
                                        TokenStorage.saveToken(token)
                                        FcmUtils.sendFcmTokenIfAvailable()
                                        val user = RetrofitInstance.userApi.getCurrentUser("Bearer $token")
                                        UserStorage.saveUser(user)
                                        navController.navigate("dashboard") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    } else {
                                        error = "Порожній токен"
                                    }
                                } else {
                                    error = "Невірні дані для входу"
                                }
                            } catch (e: Exception) {
                                error = "Помилка: ${e.message}"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                ) {
                    if (isLoading)
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    else
                        Text("Увійти")
                }

                OutlinedButton(
                    onClick = {
                        Log.d("LoginScreen", "Google login button clicked")
                        GoogleAuthHelper.googleLogin(
                            activity = activity,
                            launcher = googleLauncher,
                            onSuccess = {
                                FcmUtils.sendFcmTokenIfAvailable()
                                navController.navigate("dashboard") {
                                    popUpTo("login") { inclusive = true }
                                }
                            }
                        )
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Увійти через Google")
                }

                TextButton(
                    onClick = { navController.navigate("register") },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Ще не маєте акаунту? Зареєструватись")
                }
            }
        }
    }
}