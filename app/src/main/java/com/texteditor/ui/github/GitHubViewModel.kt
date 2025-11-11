package com.texteditor.ui.github

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.texteditor.data.api.RetrofitClient
import com.texteditor.data.models.*
import com.texteditor.data.repository.GitHubRepository
import com.texteditor.utils.PreferencesManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class GitHubViewModel(application: Application) : AndroidViewModel(application) {

    private val gitHubRepository: GitHubRepository
    private val preferencesManager: PreferencesManager

    private val _user = MutableLiveData<GitHubUser?>()
    val user: LiveData<GitHubUser?> = _user

    private val _repos = MutableLiveData<List<GitHubRepo>>()
    val repos: LiveData<List<GitHubRepo>> = _repos

    private val _contents = MutableLiveData<List<GitHubContent>>()
    val contents: LiveData<List<GitHubContent>> = _contents

    private val _fileContent = MutableLiveData<String>()
    val fileContent: LiveData<String> = _fileContent

    private val _commits = MutableLiveData<List<GitHubCommit>>()
    val commits: LiveData<List<GitHubCommit>> = _commits

    private val _branches = MutableLiveData<List<GitHubBranch>>()
    val branches: LiveData<List<GitHubBranch>> = _branches

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    private val _operationSuccess = MutableLiveData<String>()
    val operationSuccess: LiveData<String> = _operationSuccess

    private var currentToken: String? = null
    private var currentRepo: GitHubRepo? = null
    private var currentBranch: String? = null
    private var currentPath: String = ""

    init {
        gitHubRepository = GitHubRepository(RetrofitClient.gitHubApi)
        preferencesManager = PreferencesManager(application)
        
        viewModelScope.launch {
            preferencesManager.githubToken.collect { token ->
                currentToken = token
                if (token != null) {
                    loadUser()
                } else {
                    _user.value = null
                }
            }
        }
    }

    fun saveToken(token: String) {
        viewModelScope.launch {
            preferencesManager.saveGithubToken(token)
            currentToken = token
            loadUser()
        }
    }

    fun logout() {
        viewModelScope.launch {
            preferencesManager.saveGithubToken(null)
            currentToken = null
            _user.value = null
            _repos.value = emptyList()
        }
    }

    private fun loadUser() {
        val token = currentToken ?: return
        viewModelScope.launch {
            _loading.value = true
            val result = gitHubRepository.getCurrentUser(token)
            result.onSuccess { githubUser ->
                _user.value = githubUser
                loadRepositories()
            }.onFailure { exception ->
                _error.value = "Failed to load user: ${exception.message}"
                _user.value = null
            }
            _loading.value = false
        }
    }

    fun loadRepositories() {
        val token = currentToken ?: return
        viewModelScope.launch {
            _loading.value = true
            val result = gitHubRepository.getUserRepos(token)
            result.onSuccess { repoList ->
                _repos.value = repoList
            }.onFailure { exception ->
                _error.value = "Failed to load repositories: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun selectRepository(repo: GitHubRepo) {
        currentRepo = repo
        currentBranch = repo.defaultBranch
        currentPath = ""
        loadRepoContents()
        loadBranches()
    }

    fun loadRepoContents(path: String = "") {
        val token = currentToken ?: return
        val repo = currentRepo ?: return
        
        viewModelScope.launch {
            _loading.value = true
            currentPath = path
            
            val ownerRepo = repo.fullName.split("/")
            val result = gitHubRepository.getRepoContents(
                token, ownerRepo[0], ownerRepo[1], path, currentBranch
            )
            
            result.onSuccess { contentList ->
                _contents.value = contentList.sortedWith(
                    compareBy({ it.type != "dir" }, { it.name.lowercase() })
                )
            }.onFailure { exception ->
                _error.value = "Failed to load contents: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun loadFileContent(content: GitHubContent) {
        val token = currentToken ?: return
        val repo = currentRepo ?: return
        
        viewModelScope.launch {
            _loading.value = true
            
            val ownerRepo = repo.fullName.split("/")
            val result = gitHubRepository.getFileContent(
                token, ownerRepo[0], ownerRepo[1], content.path, currentBranch
            )
            
            result.onSuccess { fileText ->
                _fileContent.value = fileText
            }.onFailure { exception ->
                _error.value = "Failed to load file: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun commitFile(path: String, content: String, message: String, sha: String? = null) {
        val token = currentToken ?: return
        val repo = currentRepo ?: return
        
        viewModelScope.launch {
            _loading.value = true
            
            val ownerRepo = repo.fullName.split("/")
            val result = gitHubRepository.createOrUpdateFile(
                token, ownerRepo[0], ownerRepo[1], path, content, message, currentBranch, sha
            )
            
            result.onSuccess {
                _operationSuccess.value = "File committed successfully"
                loadRepoContents(currentPath)
            }.onFailure { exception ->
                _error.value = "Failed to commit file: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun loadCommits() {
        val token = currentToken ?: return
        val repo = currentRepo ?: return
        
        viewModelScope.launch {
            _loading.value = true
            
            val ownerRepo = repo.fullName.split("/")
            val result = gitHubRepository.getCommits(
                token, ownerRepo[0], ownerRepo[1], currentBranch
            )
            
            result.onSuccess { commitList ->
                _commits.value = commitList
            }.onFailure { exception ->
                _error.value = "Failed to load commits: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun loadBranches() {
        val token = currentToken ?: return
        val repo = currentRepo ?: return
        
        viewModelScope.launch {
            _loading.value = true
            
            val ownerRepo = repo.fullName.split("/")
            val result = gitHubRepository.getBranches(token, ownerRepo[0], ownerRepo[1])
            
            result.onSuccess { branchList ->
                _branches.value = branchList
            }.onFailure { exception ->
                _error.value = "Failed to load branches: ${exception.message}"
            }
            _loading.value = false
        }
    }

    fun switchBranch(branchName: String) {
        currentBranch = branchName
        currentPath = ""
        loadRepoContents()
    }

    fun navigateUp() {
        if (currentPath.isNotEmpty()) {
            val parent = currentPath.substringBeforeLast('/', "")
            loadRepoContents(parent)
        }
    }

    fun isAuthenticated(): Boolean = currentToken != null

    fun getCurrentRepo(): GitHubRepo? = currentRepo
    fun getCurrentBranch(): String? = currentBranch
    fun getCurrentPath(): String = currentPath
}
