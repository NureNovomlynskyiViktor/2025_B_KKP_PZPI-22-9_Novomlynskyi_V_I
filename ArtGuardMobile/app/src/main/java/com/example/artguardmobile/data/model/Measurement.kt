package com.example.artguardmobile.data.model

import com.google.gson.annotations.SerializedName

data class Measurement(
    val id: Int,
    @SerializedName("sensor_id") val sensorId: Int,
    val value: Double,
    @SerializedName("measured_at") val measuredAt: String
)
