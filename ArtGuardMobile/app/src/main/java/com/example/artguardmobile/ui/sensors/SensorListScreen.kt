package com.example.artguardmobile.ui.sensors

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.example.artguardmobile.data.model.SensorViewModel
import com.example.artguardmobile.data.model.SensorWithObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorListScreen(navController: NavHostController) {
    val viewModel: SensorViewModel = viewModel()
    val sensors by viewModel.sensors.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchSensors()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Сенсори") },
                navigationIcon = {
                    IconButton(onClick = { navController.navigate("dashboard") }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Назад"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            when {
                isLoading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }

                error != null -> {
                    Text("Помилка: $error", color = MaterialTheme.colorScheme.error)
                }

                else -> {
                    LazyColumn {
                        items(sensors) { sensor ->
                            SensorCard(sensor = sensor, onDetailsClick = {
                                navController.navigate("sensor-details/${sensor.id}")
                            })
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SensorCard(sensor: SensorWithObject, onDetailsClick: () -> Unit) {
    val icon: ImageVector = when (sensor.type.lowercase()) {
        "temperature" -> Icons.Filled.Thermostat
        "humidity" -> Icons.Filled.WaterDrop
        "vibration" -> Icons.Filled.Vibration
        else -> Icons.Filled.Sensors
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Об'єкт: ${sensor.objectName ?: "Невідомо"}",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text("Тип: ${sensor.type}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Одиниця: ${sensor.unit}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Ідентифікатор: ${sensor.identifier}", color = MaterialTheme.colorScheme.onSurfaceVariant)

            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                Button(onClick = onDetailsClick) {
                    Text("Детальніше")
                }
            }
        }
    }
}








