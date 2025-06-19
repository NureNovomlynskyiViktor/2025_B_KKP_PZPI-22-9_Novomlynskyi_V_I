package com.example.artguardmobile.data.model

import com.google.gson.annotations.SerializedName

data class Alert(
    val id: Int,
    @SerializedName("sensor_id") val sensorId: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("alert_type") val alertType: String,
    @SerializedName("alert_message") val alertMessage: String,
    val viewed: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("resolved_at") val resolvedAt: String?,
    @SerializedName("resolved_by") val resolvedBy: String?,
    @SerializedName("resolved_by_user_id") val resolvedByUserId: Int?,
    @SerializedName("resolved_by_user_name") val resolvedByUserName: String?
)
