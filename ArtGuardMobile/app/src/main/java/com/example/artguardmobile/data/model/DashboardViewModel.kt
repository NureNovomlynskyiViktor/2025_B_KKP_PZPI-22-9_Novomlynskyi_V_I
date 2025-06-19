package com.example.artguardmobile.data.model

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import kotlinx.coroutines.launch

class DashboardViewModel : ViewModel() {

    val objects: MutableState<List<ArtObject>> = mutableStateOf(emptyList())
    val isLoading: MutableState<Boolean> = mutableStateOf(true)

    init {
        viewModelScope.launch {
            try {
                val token = TokenStorage.getToken()
                if (token != null) {
                    objects.value = RetrofitInstance.objectApi.getObjects()
                }
            } catch (e: Exception) {
                println("❌ Error loading objects: ${e.message}")
            } finally {
                isLoading.value = false
            }
        }
    }
}

