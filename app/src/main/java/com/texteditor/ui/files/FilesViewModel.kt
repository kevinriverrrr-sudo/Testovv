package com.texteditor.ui.files

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.texteditor.data.database.AppDatabase
import com.texteditor.data.models.FileItem
import com.texteditor.data.repository.FileRepository
import com.texteditor.utils.FileUtils
import com.texteditor.utils.PreferencesManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class FilesViewModel(application: Application) : AndroidViewModel(application) {

    private val fileRepository: FileRepository
    private val preferencesManager: PreferencesManager

    private val _files = MutableLiveData<List<FileItem>>()
    val files: LiveData<List<FileItem>> = _files

    val recentFiles: LiveData<List<FileItem>> = fileRepository.recentFiles

    private val _currentPath = MutableLiveData<String>()
    val currentPath: LiveData<String> = _currentPath

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    private val _operationSuccess = MutableLiveData<String>()
    val operationSuccess: LiveData<String> = _operationSuccess

    init {
        val database = AppDatabase.getDatabase(application)
        fileRepository = FileRepository(database.fileDao())
        preferencesManager = PreferencesManager(application)
        
        viewModelScope.launch {
            val lastDir = preferencesManager.lastDirectory.first()
            val initialPath = lastDir ?: FileUtils.getDefaultDirectory()
            navigateToDirectory(initialPath)
        }
    }

    fun navigateToDirectory(path: String) {
        viewModelScope.launch {
            _currentPath.value = path
            preferencesManager.saveLastDirectory(path)
            val result = fileRepository.listFiles(path)
            result.onSuccess { fileList ->
                _files.value = fileList
            }.onFailure { exception ->
                _error.value = "Failed to load directory: ${exception.message}"
            }
        }
    }

    fun navigateUp() {
        val current = _currentPath.value ?: return
        val parent = FileUtils.getParentPath(current)
        if (parent != null) {
            navigateToDirectory(parent)
        }
    }

    fun deleteFile(path: String) {
        viewModelScope.launch {
            val result = fileRepository.deleteFile(path)
            result.onSuccess {
                _operationSuccess.value = "File deleted successfully"
                _currentPath.value?.let { navigateToDirectory(it) }
            }.onFailure { exception ->
                _error.value = "Failed to delete file: ${exception.message}"
            }
        }
    }

    fun renameFile(oldPath: String, newName: String) {
        viewModelScope.launch {
            val parent = FileUtils.getParentPath(oldPath)
            if (parent == null) {
                _error.value = "Invalid file path"
                return@launch
            }
            
            if (!FileUtils.isValidFileName(newName)) {
                _error.value = "Invalid file name"
                return@launch
            }

            val newPath = "$parent/$newName"
            val result = fileRepository.renameFile(oldPath, newPath)
            result.onSuccess {
                _operationSuccess.value = "File renamed successfully"
                _currentPath.value?.let { navigateToDirectory(it) }
            }.onFailure { exception ->
                _error.value = "Failed to rename file: ${exception.message}"
            }
        }
    }

    fun duplicateFile(sourcePath: String) {
        viewModelScope.launch {
            val parent = FileUtils.getParentPath(sourcePath)
            if (parent == null) {
                _error.value = "Invalid file path"
                return@launch
            }

            val sourceFile = java.io.File(sourcePath)
            val newName = FileUtils.generateUniqueFileName(parent, "Copy_${sourceFile.name}")
            val targetPath = "$parent/$newName"

            val result = fileRepository.duplicateFile(sourcePath, targetPath)
            result.onSuccess {
                _operationSuccess.value = "File duplicated successfully"
                _currentPath.value?.let { navigateToDirectory(it) }
            }.onFailure { exception ->
                _error.value = "Failed to duplicate file: ${exception.message}"
            }
        }
    }

    fun createNewFile(fileName: String) {
        viewModelScope.launch {
            val currentDir = _currentPath.value
            if (currentDir == null) {
                _error.value = "No directory selected"
                return@launch
            }

            if (!FileUtils.isValidFileName(fileName)) {
                _error.value = "Invalid file name"
                return@launch
            }

            val filePath = "$currentDir/$fileName"
            val result = fileRepository.createFile(filePath)
            result.onSuccess {
                _operationSuccess.value = "File created successfully"
                navigateToDirectory(currentDir)
            }.onFailure { exception ->
                _error.value = "Failed to create file: ${exception.message}"
            }
        }
    }

    fun createNewFolder(folderName: String) {
        viewModelScope.launch {
            val currentDir = _currentPath.value
            if (currentDir == null) {
                _error.value = "No directory selected"
                return@launch
            }

            if (!FileUtils.isValidFileName(folderName)) {
                _error.value = "Invalid folder name"
                return@launch
            }

            try {
                val folderPath = "$currentDir/$folderName"
                val folder = java.io.File(folderPath)
                if (folder.exists()) {
                    _error.value = "Folder already exists"
                    return@launch
                }
                
                if (folder.mkdirs()) {
                    _operationSuccess.value = "Folder created successfully"
                    navigateToDirectory(currentDir)
                } else {
                    _error.value = "Failed to create folder"
                }
            } catch (e: Exception) {
                _error.value = "Failed to create folder: ${e.message}"
            }
        }
    }

    fun clearRecentFiles() {
        viewModelScope.launch {
            fileRepository.clearRecentFiles()
            _operationSuccess.value = "Recent files cleared"
        }
    }
}
