package com.texteditor.data.repository

import android.util.Base64
import com.texteditor.data.api.GitHubApi
import com.texteditor.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GitHubRepository(private val api: GitHubApi) {

    suspend fun getCurrentUser(token: String): Result<GitHubUser> = withContext(Dispatchers.IO) {
        try {
            val response = api.getCurrentUser("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserRepos(token: String): Result<List<GitHubRepo>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getUserRepos("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get repos: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getRepoContents(
        token: String,
        owner: String,
        repo: String,
        path: String = "",
        branch: String? = null
    ): Result<List<GitHubContent>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getRepoContents("Bearer $token", owner, repo, path, branch)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get contents: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getFileContent(
        token: String,
        owner: String,
        repo: String,
        path: String,
        branch: String? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.getFileContent("Bearer $token", owner, repo, path, branch)
            if (response.isSuccessful && response.body() != null) {
                val content = response.body()!!
                if (content.content != null && content.encoding == "base64") {
                    val decodedContent = String(Base64.decode(content.content.replace("\n", ""), Base64.DEFAULT))
                    Result.success(decodedContent)
                } else {
                    Result.failure(Exception("Invalid content encoding"))
                }
            } else {
                Result.failure(Exception("Failed to get file: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createOrUpdateFile(
        token: String,
        owner: String,
        repo: String,
        path: String,
        content: String,
        message: String,
        branch: String? = null,
        sha: String? = null
    ): Result<CreateFileResponse> = withContext(Dispatchers.IO) {
        try {
            val encodedContent = Base64.encodeToString(content.toByteArray(), Base64.NO_WRAP)
            val request = CreateFileRequest(message, encodedContent, branch, sha)
            val response = api.createOrUpdateFile("Bearer $token", owner, repo, path, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update file: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCommits(
        token: String,
        owner: String,
        repo: String,
        branch: String? = null
    ): Result<List<GitHubCommit>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getCommits("Bearer $token", owner, repo, branch)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get commits: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getBranches(
        token: String,
        owner: String,
        repo: String
    ): Result<List<GitHubBranch>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getBranches("Bearer $token", owner, repo)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get branches: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
