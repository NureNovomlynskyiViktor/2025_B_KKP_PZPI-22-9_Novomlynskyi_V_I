package com.example.artguardmobile.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val token: String)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)
data class RegisterResponse(val token: String)

data class GoogleLoginRequest(val idToken: String)

interface AuthService {
    @POST("/api/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("/api/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("/api/google-login")
    suspend fun loginWithGoogle(@Body request: GoogleLoginRequest): Response<LoginResponse>
}


