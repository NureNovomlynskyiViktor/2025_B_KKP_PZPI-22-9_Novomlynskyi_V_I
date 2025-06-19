package com.example.artguardmobile.data.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.artguardmobile.data.network.LoginRequest
import com.example.artguardmobile.data.network.RetrofitInstance
import com.example.artguardmobile.data.storage.TokenStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    private val _loginState = MutableStateFlow<String?>(null)
    val loginState = _loginState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                val response = RetrofitInstance.api.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val token = response.body()?.token ?: ""
                    TokenStorage.saveToken(token)
                    _loginState.value = token
                } else {
                    _loginState.value = "error"
                }
            } catch (e: Exception) {
                _loginState.value = "exception"
            }
        }
    }
}
