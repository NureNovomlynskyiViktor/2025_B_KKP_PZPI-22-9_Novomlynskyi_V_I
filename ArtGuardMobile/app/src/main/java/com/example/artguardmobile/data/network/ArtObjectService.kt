package com.example.artguardmobile.data.network

import com.example.artguardmobile.data.model.ArtObject
import retrofit2.http.GET

interface ArtObjectService {
    @GET("/api/objects")
    suspend fun getObjects(): List<ArtObject>
}
