package com.texteditor.data.api

import com.texteditor.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface GitHubApi {
    @GET("user")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<GitHubUser>

    @GET("user/repos")
    suspend fun getUserRepos(
        @Header("Authorization") token: String,
        @Query("sort") sort: String = "updated",
        @Query("per_page") perPage: Int = 100
    ): Response<List<GitHubRepo>>

    @GET("repos/{owner}/{repo}/contents/{path}")
    suspend fun getRepoContents(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String,
        @Path("path", encoded = true) path: String = "",
        @Query("ref") branch: String? = null
    ): Response<List<GitHubContent>>

    @GET("repos/{owner}/{repo}/contents/{path}")
    suspend fun getFileContent(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String,
        @Path("path", encoded = true) path: String,
        @Query("ref") branch: String? = null
    ): Response<GitHubContent>

    @PUT("repos/{owner}/{repo}/contents/{path}")
    suspend fun createOrUpdateFile(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String,
        @Path("path", encoded = true) path: String,
        @Body request: CreateFileRequest
    ): Response<CreateFileResponse>

    @GET("repos/{owner}/{repo}/commits")
    suspend fun getCommits(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String,
        @Query("sha") branch: String? = null,
        @Query("per_page") perPage: Int = 30
    ): Response<List<GitHubCommit>>

    @GET("repos/{owner}/{repo}/branches")
    suspend fun getBranches(
        @Header("Authorization") token: String,
        @Path("owner") owner: String,
        @Path("repo") repo: String
    ): Response<List<GitHubBranch>>
}
