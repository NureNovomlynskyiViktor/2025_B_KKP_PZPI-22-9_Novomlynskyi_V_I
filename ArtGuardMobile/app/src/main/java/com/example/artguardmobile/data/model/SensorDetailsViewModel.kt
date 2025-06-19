package com.example.artguardmobile.data.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SensorDetailsViewModel : ViewModel() {

    private val _measurements = MutableStateFlow<List<Measurement>>(emptyList())
    val measurements: StateFlow<List<Measurement>> = _measurements

    private val _sensor = MutableStateFlow<SensorWithObject?>(null)
    val sensor: StateFlow<SensorWithObject?> = _sensor

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun loadMeasurements(sensorId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    val result = RetrofitInstance.sensorMeasurementApi.getMeasurementsBySensor(
                        token = "Bearer $token",
                        sensorId = sensorId
                    )
                    _measurements.value = result.reversed()
                } else {
                    _error.value = "Немає токена"
                }
            } catch (e: Exception) {
                _error.value = "Помилка: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun loadSensor(sensorId: Int) {
        viewModelScope.launch {
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    val allSensors = RetrofitInstance.sensorApi.getSensorsWithObject("Bearer $token")
                    _sensor.value = allSensors.find { it.id == sensorId }
                } else {
                    _error.value = "Немає токена"
                }
            } catch (e: Exception) {
                _error.value = "Помилка завантаження сенсора: ${e.message}"
            }
        }
    }
}


