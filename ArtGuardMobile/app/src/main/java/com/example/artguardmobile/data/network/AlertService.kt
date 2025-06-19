package com.example.artguardmobile.data.network

import com.example.artguardmobile.data.model.Alert
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.Path

interface AlertService {
    @GET("/api/alerts")
    suspend fun getAlerts(
        @Header("Authorization") token: String
    ): List<Alert>

    @PATCH("/api/alerts/{id}/viewed")
    suspend fun markAlertViewed(
        @Path("id") id: Int,
        @Header("Authorization") token: String
    ): Response<Unit>
}




