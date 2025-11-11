package com.texteditor.data.repository

import androidx.lifecycle.LiveData
import com.texteditor.data.database.FileDao
import com.texteditor.data.models.FileItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class FileRepository(private val fileDao: FileDao) {
    
    val recentFiles: LiveData<List<FileItem>> = fileDao.getRecentFiles()

    suspend fun addRecentFile(fileItem: FileItem) {
        withContext(Dispatchers.IO) {
            fileDao.insertFile(fileItem)
        }
    }

    suspend fun removeRecentFile(path: String) {
        withContext(Dispatchers.IO) {
            fileDao.deleteByPath(path)
        }
    }

    suspend fun clearRecentFiles() {
        withContext(Dispatchers.IO) {
            fileDao.clearAll()
        }
    }

    suspend fun readFile(path: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val file = File(path)
            if (!file.exists()) {
                return@withContext Result.failure(Exception("File does not exist"))
            }
            if (!file.canRead()) {
                return@withContext Result.failure(Exception("Cannot read file"))
            }
            val content = file.readText()
            Result.success(content)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun writeFile(path: String, content: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val file = File(path)
            file.parentFile?.mkdirs()
            file.writeText(content)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createFile(path: String): Result<File> = withContext(Dispatchers.IO) {
        try {
            val file = File(path)
            if (file.exists()) {
                return@withContext Result.failure(Exception("File already exists"))
            }
            file.parentFile?.mkdirs()
            file.createNewFile()
            Result.success(file)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteFile(path: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val file = File(path)
            if (file.exists()) {
                file.deleteRecursively()
            }
            removeRecentFile(path)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun renameFile(oldPath: String, newPath: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val oldFile = File(oldPath)
            val newFile = File(newPath)
            if (!oldFile.exists()) {
                return@withContext Result.failure(Exception("File does not exist"))
            }
            if (newFile.exists()) {
                return@withContext Result.failure(Exception("Target file already exists"))
            }
            oldFile.renameTo(newFile)
            removeRecentFile(oldPath)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun duplicateFile(sourcePath: String, targetPath: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val sourceFile = File(sourcePath)
            val targetFile = File(targetPath)
            if (!sourceFile.exists()) {
                return@withContext Result.failure(Exception("Source file does not exist"))
            }
            if (targetFile.exists()) {
                return@withContext Result.failure(Exception("Target file already exists"))
            }
            sourceFile.copyTo(targetFile, overwrite = false)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun listFiles(directory: String): Result<List<FileItem>> = withContext(Dispatchers.IO) {
        try {
            val dir = File(directory)
            if (!dir.exists() || !dir.isDirectory) {
                return@withContext Result.failure(Exception("Invalid directory"))
            }
            val files = dir.listFiles()?.map { FileItem.fromFile(it) } ?: emptyList()
            Result.success(files.sortedWith(compareBy({ !it.isDirectory }, { it.name.lowercase() })))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
