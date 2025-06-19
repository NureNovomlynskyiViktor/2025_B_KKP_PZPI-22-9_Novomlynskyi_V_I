package com.example.artguardmobile.ui

import android.app.Activity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.artguardmobile.data.model.DashboardViewModel
import com.example.artguardmobile.data.storage.TokenStorage
import com.example.artguardmobile.data.storage.UserStorage
import com.example.artguardmobile.ui.alerts.AlertListScreen
import com.example.artguardmobile.ui.dashboard.DashboardScreen
import com.example.artguardmobile.ui.login.LoginScreen
import com.example.artguardmobile.ui.login.RegisterScreen
import com.example.artguardmobile.ui.sensors.SensorListScreen
import com.example.artguardmobile.ui.sensors.SensorDetailsScreen

@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = "login",
    activity: Activity,
    googleLauncher: ActivityResultLauncher<IntentSenderRequest>
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            LoginScreen(
                navController = navController,
                googleLauncher = googleLauncher,
                activity = activity
            )
        }
        composable("register") { RegisterScreen(navController) }
        composable("dashboard") {
            val dashboardViewModel: DashboardViewModel = viewModel()
            val user = UserStorage.getUser()
            DashboardScreen(
                user = user,
                objects = dashboardViewModel.objects.value,
                onLogout = {
                    TokenStorage.clearToken()
                    UserStorage.clearUser()
                    navController.navigate("login") {
                        popUpTo("dashboard") { inclusive = true }
                    }
                },
                onNavigateToSensors = { navController.navigate("sensors") },
                onNavigateToAlerts = { navController.navigate("alerts") }
            )
        }
        composable("sensors") { SensorListScreen(navController) }
        composable("alerts") { AlertListScreen(navController) }

        composable("sensor-details/{sensorId}") { backStackEntry ->
            val sensorId = backStackEntry.arguments?.getString("sensorId")?.toIntOrNull() ?: return@composable
            SensorDetailsScreen(sensorId = sensorId, navController = navController)
        }
    }
}









