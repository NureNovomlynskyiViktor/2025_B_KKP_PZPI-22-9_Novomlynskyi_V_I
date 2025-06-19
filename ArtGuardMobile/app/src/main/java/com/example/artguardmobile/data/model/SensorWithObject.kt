package com.example.artguardmobile.data.model

import com.google.gson.annotations.SerializedName

data class SensorWithObject(
    val id: Int,
    val objectId: Int,
    @SerializedName("object_name") val objectName: String?,
    val type: String,
    val unit: String,
    val identifier: String,
    val createdAt: String
)
