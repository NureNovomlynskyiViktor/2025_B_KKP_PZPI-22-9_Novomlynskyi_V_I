package com.example.artguardmobile.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.artguardmobile.data.model.ArtObject
import com.example.artguardmobile.data.model.User
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    user: User?,
    objects: List<ArtObject>,
    onLogout: () -> Unit,
    onNavigateToSensors: () -> Unit,
    onNavigateToAlerts: () -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = user?.name + " (" + user?.role + ")",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider()
                    Spacer(modifier = Modifier.height(8.dp))
                    if (user?.role?.lowercase() != "viewer") {
                        NavigationDrawerItem(
                            label = { Text("Сенсори") },
                            selected = false,
                            onClick = onNavigateToSensors
                        )
                        NavigationDrawerItem(
                            label = { Text("Сповіщення") },
                            selected = false,
                            onClick = onNavigateToAlerts
                        )
                    }
                    NavigationDrawerItem(
                        label = { Text("Вийти") },
                        selected = false,
                        onClick = onLogout
                    )
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("ArtGuard Dashboard") },
                    navigationIcon = {
                        IconButton(onClick = {
                            scope.launch {
                                if (drawerState.isClosed) drawerState.open() else drawerState.close()
                            }
                        }) {
                            Icon(Icons.Filled.Menu, contentDescription = "Меню")
                        }
                    }
                )
            }
        ) { paddingValues ->
            if (objects.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Немає доступних експонатів", style = MaterialTheme.typography.bodyMedium)
                }
            } else {
                LazyColumn(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
                    items(objects) { artObject ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            elevation = CardDefaults.cardElevation(4.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Експонат: ${artObject.name}", style = MaterialTheme.typography.titleMedium)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Матеріал: ${artObject.material}", style = MaterialTheme.typography.bodyMedium)
                                Text("Опис: ${artObject.description}", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
}





