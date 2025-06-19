package com.example.artguardmobile.data.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SensorViewModel : ViewModel() {

    private val _sensors = MutableStateFlow<List<SensorWithObject>>(emptyList())
    val sensors: StateFlow<List<SensorWithObject>> = _sensors

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun fetchSensors(withObjectNames: Boolean = true) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    _sensors.value = if (withObjectNames) {
                        RetrofitInstance.sensorApi.getSensorsWithObject("Bearer $token")
                    } else {
                        RetrofitInstance.sensorApi.getSensors("Bearer $token")
                            .map { sensor ->
                                SensorWithObject(
                                    id = sensor.id,
                                    objectId = sensor.objectId,
                                    objectName = "",
                                    type = sensor.type,
                                    unit = sensor.unit,
                                    identifier = sensor.identifier,
                                    createdAt = sensor.createdAt
                                )
                            }
                    }
                } else {
                    _error.value = "Немає токена авторизації"
                }
            } catch (e: Exception) {
                _error.value = "Помилка завантаження: ${e.localizedMessage}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}


