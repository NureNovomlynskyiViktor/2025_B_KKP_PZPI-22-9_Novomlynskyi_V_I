package com.example.artguardmobile.data.network

import com.example.artguardmobile.data.model.Measurement
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path

interface SensorMeasurementService {
    @GET("/api/measurements/sensor/{id}")
    suspend fun getMeasurementsBySensor(
        @Path("id") sensorId: Int,
        @Header("Authorization") token: String
    ): List<Measurement>

}
