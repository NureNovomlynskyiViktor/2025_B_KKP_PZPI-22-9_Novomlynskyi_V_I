package com.example.artguardmobile.data.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class AlertViewModel : ViewModel() {

    private val _allAlerts = MutableStateFlow<List<Alert>>(emptyList())
    private val _filterUnreadOnly = MutableStateFlow(false)

    val alerts: StateFlow<List<Alert>> = combine(_allAlerts, _filterUnreadOnly) { alerts, onlyUnread ->
        if (onlyUnread) alerts.filter { !it.viewed } else alerts
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filterUnreadOnly: StateFlow<Boolean> = _filterUnreadOnly

    fun toggleFilterUnread(onlyUnread: Boolean) {
        _filterUnreadOnly.value = onlyUnread
    }

    fun loadAlerts() {
        viewModelScope.launch {
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    println("📦 TOKEN => Bearer $token")
                    val result = RetrofitInstance.alertApi.getAlerts("Bearer $token")
                    _allAlerts.value = result
                }
            } catch (e: Exception) {
                println("❌ Помилка завантаження сповіщень: ${e.message}")
            }
        }
    }

    fun markViewed(id: Int) {
        viewModelScope.launch {
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    val response = RetrofitInstance.alertApi.markAlertViewed(id, "Bearer $token")
                    if (response.isSuccessful) {
                        loadAlerts()
                    }
                }
            } catch (e: Exception) {
                println("❌ Не вдалося позначити як переглянуте: ${e.message}")
            }
        }
    }
}


