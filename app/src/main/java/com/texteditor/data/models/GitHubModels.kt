package com.texteditor.data.models

import com.google.gson.annotations.SerializedName

data class GitHubUser(
    val login: String,
    val id: Long,
    @SerializedName("avatar_url")
    val avatarUrl: String?,
    val name: String?,
    val email: String?,
    @SerializedName("public_repos")
    val publicRepos: Int = 0
)

data class GitHubRepo(
    val id: Long,
    val name: String,
    @SerializedName("full_name")
    val fullName: String,
    val description: String?,
    val private: Boolean,
    @SerializedName("html_url")
    val htmlUrl: String,
    @SerializedName("clone_url")
    val cloneUrl: String,
    @SerializedName("default_branch")
    val defaultBranch: String = "main",
    @SerializedName("updated_at")
    val updatedAt: String
)

data class GitHubContent(
    val name: String,
    val path: String,
    val sha: String,
    val size: Long,
    val type: String,
    @SerializedName("download_url")
    val downloadUrl: String?,
    val content: String?,
    val encoding: String?
)

data class GitHubCommit(
    val sha: String,
    val commit: CommitDetail,
    val author: GitHubUser?,
    @SerializedName("html_url")
    val htmlUrl: String
)

data class CommitDetail(
    val message: String,
    val author: CommitAuthor
)

data class CommitAuthor(
    val name: String,
    val email: String,
    val date: String
)

data class GitHubBranch(
    val name: String,
    val commit: BranchCommit,
    val protected: Boolean = false
)

data class BranchCommit(
    val sha: String,
    val url: String
)

data class CreateFileRequest(
    val message: String,
    val content: String,
    val branch: String? = null,
    val sha: String? = null
)

data class CreateFileResponse(
    val content: GitHubContent,
    val commit: CommitInfo
)

data class CommitInfo(
    val sha: String,
    val message: String
)
