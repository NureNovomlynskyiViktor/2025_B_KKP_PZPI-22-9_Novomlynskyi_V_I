package com.example.artguardmobile.data.network

import com.example.artguardmobile.data.model.Sensor
import com.example.artguardmobile.data.model.SensorWithObject
import retrofit2.http.GET
import retrofit2.http.Header

interface SensorService {
    @GET("/api/sensors")
    suspend fun getSensors(
        @Header("Authorization") token: String
    ): List<Sensor>

    @GET("/api/sensors-with-object")
    suspend fun getSensorsWithObject(
        @Header("Authorization") token: String
    ): List<SensorWithObject>

}

