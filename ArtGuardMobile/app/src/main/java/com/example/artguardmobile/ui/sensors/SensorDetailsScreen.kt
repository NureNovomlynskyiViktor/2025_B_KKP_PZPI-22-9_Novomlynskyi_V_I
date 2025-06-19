package com.example.artguardmobile.ui.sensors

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.example.artguardmobile.data.model.SensorDetailsViewModel
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.core.entry.FloatEntry
import com.patrykandpatrick.vico.core.entry.entryModelOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorDetailsScreen(
    sensorId: Int,
    navController: NavHostController,
    viewModel: SensorDetailsViewModel = viewModel()
) {
    val measurements by viewModel.measurements.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val sensor by viewModel.sensor.collectAsState()

    LaunchedEffect(sensorId) {
        viewModel.loadMeasurements(sensorId)
        viewModel.loadSensor(sensorId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    if (sensor != null) {
                        Text(
                            text = "${sensor!!.type} — ${sensor!!.objectName ?: "Об’єкт"} [${sensor!!.identifier}]"
                        )
                    } else {
                        Text("Графік сенсора #$sensorId")
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Назад"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            when {
                isLoading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                error != null -> Text("Помилка: $error")
                measurements.isEmpty() -> Text("Немає даних")
                else -> {
                    val entries = measurements.mapIndexed { index, m ->
                        FloatEntry(x = index.toFloat(), y = m.value.toFloat())
                    }

                    Chart(
                        chart = lineChart(),
                        model = entryModelOf(entries),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                    )
                }
            }
        }
    }
}





