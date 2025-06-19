package com.example.artguardmobile.ui.alerts

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.example.artguardmobile.data.model.Alert
import com.example.artguardmobile.data.model.AlertViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertListScreen(navController: NavHostController, viewModel: AlertViewModel = viewModel()) {
    val alerts by viewModel.alerts.collectAsState()
    val onlyUnread by viewModel.filterUnreadOnly.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadAlerts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Сповіщення") },
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
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = !onlyUnread,
                    onClick = { viewModel.toggleFilterUnread(false) },
                    label = { Text("Всі") }
                )
                FilterChip(
                    selected = onlyUnread,
                    onClick = { viewModel.toggleFilterUnread(true) },
                    label = { Text("Непрочитані") }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn {
                items(alerts) { alert ->
                    AlertItem(alert, viewModel)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun AlertItem(alert: Alert, viewModel: AlertViewModel = viewModel()) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (alert.viewed) MaterialTheme.colorScheme.surface
            else MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text("Тип: ${alert.alertType}", style = MaterialTheme.typography.titleSmall)
            Text("Повідомлення: ${alert.alertMessage}")
            Text("Переглянуто: ${if (alert.viewed) "Так" else "Ні"}")

            if (!alert.viewed) {
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { viewModel.markViewed(alert.id) }) {
                    Text("Позначити як переглянуте")
                }
            }
        }
    }
}



