package com.example.artguardmobile.data.network

import com.example.artguardmobile.data.model.FcmTokenDto
import com.example.artguardmobile.data.model.User
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface UserService {

    @GET("/api/me")
    suspend fun getCurrentUser(
        @Header("Authorization") token: String
    ): User

    @POST("/api/user/fcm-token")
    suspend fun updateFcmToken(
        @Body tokenDto: FcmTokenDto,
        @Header("Authorization") token: String
    ): Response<Unit>

}
