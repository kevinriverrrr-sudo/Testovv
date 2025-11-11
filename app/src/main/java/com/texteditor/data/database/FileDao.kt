package com.texteditor.data.database

import androidx.lifecycle.LiveData
import androidx.room.*
import com.texteditor.data.models.FileItem

@Dao
interface FileDao {
    @Query("SELECT * FROM recent_files ORDER BY lastOpened DESC LIMIT 20")
    fun getRecentFiles(): LiveData<List<FileItem>>

    @Query("SELECT * FROM recent_files WHERE path = :path")
    suspend fun getFileByPath(path: String): FileItem?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFile(file: FileItem)

    @Delete
    suspend fun deleteFile(file: FileItem)

    @Query("DELETE FROM recent_files WHERE path = :path")
    suspend fun deleteByPath(path: String)

    @Query("DELETE FROM recent_files")
    suspend fun clearAll()
}
