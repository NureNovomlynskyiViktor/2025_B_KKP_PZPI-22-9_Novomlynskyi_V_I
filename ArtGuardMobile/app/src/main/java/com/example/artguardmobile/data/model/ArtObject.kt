package com.example.artguardmobile.data.model

data class ArtObject(
    val id: Int,
    val zone_id: Int,
    val name: String,
    val description: String,
    val material: String,
    val value: String,
    val creation_date: String,
    val updated_at: String
)
