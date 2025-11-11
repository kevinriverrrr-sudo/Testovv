package com.texteditor.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.File

@Entity(tableName = "recent_files")
data class FileItem(
    @PrimaryKey
    val path: String,
    val name: String,
    val isDirectory: Boolean,
    val lastModified: Long,
    val size: Long = 0,
    val lastOpened: Long = System.currentTimeMillis()
) {
    companion object {
        fun fromFile(file: File): FileItem {
            return FileItem(
                path = file.absolutePath,
                name = file.name,
                isDirectory = file.isDirectory,
                lastModified = file.lastModified(),
                size = if (file.isFile) file.length() else 0
            )
        }
    }
}
