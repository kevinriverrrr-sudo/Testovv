package com.texteditor.ui.editor

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.texteditor.data.database.AppDatabase
import com.texteditor.data.models.FileItem
import com.texteditor.data.repository.FileRepository
import com.texteditor.utils.PreferencesManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class EditorViewModel(application: Application) : AndroidViewModel(application) {

    private val fileRepository: FileRepository
    private val preferencesManager: PreferencesManager

    private val _content = MutableLiveData<String>()
    val content: LiveData<String> = _content

    private val _saveStatus = MutableLiveData<SaveStatus>()
    val saveStatus: LiveData<SaveStatus> = _saveStatus

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    private var currentFilePath: String? = null
    private var isModified = false
    private val undoStack = mutableListOf<String>()
    private val redoStack = mutableListOf<String>()
    private var maxUndoStackSize = 50

    init {
        val database = AppDatabase.getDatabase(application)
        fileRepository = FileRepository(database.fileDao())
        preferencesManager = PreferencesManager(application)
    }

    fun loadFile(path: String) {
        viewModelScope.launch {
            currentFilePath = path
            val result = fileRepository.readFile(path)
            result.onSuccess { fileContent ->
                _content.value = fileContent
                isModified = false
                undoStack.clear()
                redoStack.clear()
                val file = java.io.File(path)
                fileRepository.addRecentFile(FileItem.fromFile(file))
            }.onFailure { exception ->
                _error.value = "Failed to load file: ${exception.message}"
            }
        }
    }

    fun saveFile(content: String, path: String? = null) {
        viewModelScope.launch {
            val targetPath = path ?: currentFilePath
            if (targetPath == null) {
                _error.value = "No file path specified"
                return@launch
            }

            _saveStatus.value = SaveStatus.Saving
            val result = fileRepository.writeFile(targetPath, content)
            result.onSuccess {
                _saveStatus.value = SaveStatus.Saved
                isModified = false
                currentFilePath = targetPath
                val file = java.io.File(targetPath)
                fileRepository.addRecentFile(FileItem.fromFile(file))
            }.onFailure { exception ->
                _saveStatus.value = SaveStatus.Error(exception.message ?: "Unknown error")
                _error.value = "Failed to save file: ${exception.message}"
            }
        }
    }

    fun autoSave(content: String) {
        viewModelScope.launch {
            val autoSaveEnabled = preferencesManager.autoSave.first()
            if (autoSaveEnabled && currentFilePath != null && isModified) {
                saveFile(content)
            }
        }
    }

    fun createNewFile(path: String, initialContent: String = "") {
        viewModelScope.launch {
            val result = fileRepository.createFile(path)
            result.onSuccess {
                currentFilePath = path
                _content.value = initialContent
                saveFile(initialContent, path)
            }.onFailure { exception ->
                _error.value = "Failed to create file: ${exception.message}"
            }
        }
    }

    fun updateContent(newContent: String) {
        if (_content.value != newContent) {
            _content.value?.let { oldContent ->
                if (undoStack.isEmpty() || undoStack.last() != oldContent) {
                    undoStack.add(oldContent)
                    if (undoStack.size > maxUndoStackSize) {
                        undoStack.removeAt(0)
                    }
                }
            }
            redoStack.clear()
            _content.value = newContent
            isModified = true
        }
    }

    fun undo() {
        if (undoStack.isNotEmpty()) {
            val current = _content.value ?: ""
            redoStack.add(current)
            _content.value = undoStack.removeAt(undoStack.size - 1)
        }
    }

    fun redo() {
        if (redoStack.isNotEmpty()) {
            val current = _content.value ?: ""
            undoStack.add(current)
            _content.value = redoStack.removeAt(redoStack.size - 1)
        }
    }

    fun canUndo(): Boolean = undoStack.isNotEmpty()
    fun canRedo(): Boolean = redoStack.isNotEmpty()

    fun isModified(): Boolean = isModified

    fun getCurrentFilePath(): String? = currentFilePath

    sealed class SaveStatus {
        object Idle : SaveStatus()
        object Saving : SaveStatus()
        object Saved : SaveStatus()
        data class Error(val message: String) : SaveStatus()
    }
}
