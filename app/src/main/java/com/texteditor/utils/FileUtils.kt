package com.texteditor.utils

import android.os.Environment
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

object FileUtils {

    fun getDefaultDirectory(): String {
        val documentsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
        val appDir = File(documentsDir, "TextEditor")
        if (!appDir.exists()) {
            appDir.mkdirs()
        }
        return appDir.absolutePath
    }

    fun getRootDirectory(): String {
        return Environment.getExternalStorageDirectory().absolutePath
    }

    fun isTextFile(fileName: String): Boolean {
        val extension = fileName.substringAfterLast('.', "").lowercase()
        return extension in listOf(
            "txt", "md", "java", "kt", "kts", "py", "json", "xml", "html", "css", "js",
            "c", "cpp", "h", "hpp", "cs", "php", "rb", "go", "rs", "swift", "sh", "bat",
            "gradle", "properties", "yml", "yaml", "log", "ini", "conf", "cfg"
        )
    }

    fun formatFileSize(size: Long): String {
        if (size <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        val digitGroups = (Math.log10(size.toDouble()) / Math.log10(1024.0)).toInt()
        return String.format("%.1f %s", size / Math.pow(1024.0, digitGroups.toDouble()), units[digitGroups])
    }

    fun formatDate(timestamp: Long): String {
        val sdf = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
        return sdf.format(Date(timestamp))
    }

    fun getParentPath(path: String): String? {
        val file = File(path)
        return file.parent
    }

    fun generateUniqueFileName(directory: String, baseName: String): String {
        var name = baseName
        var counter = 1
        var file = File(directory, name)
        
        while (file.exists()) {
            val dotIndex = baseName.lastIndexOf('.')
            name = if (dotIndex > 0) {
                val nameWithoutExt = baseName.substring(0, dotIndex)
                val ext = baseName.substring(dotIndex)
                "${nameWithoutExt}_$counter$ext"
            } else {
                "${baseName}_$counter"
            }
            file = File(directory, name)
            counter++
        }
        
        return name
    }

    fun isValidFileName(fileName: String): Boolean {
        if (fileName.isEmpty() || fileName.isBlank()) return false
        val invalidChars = charArrayOf('/', '\\', ':', '*', '?', '"', '<', '>', '|')
        return fileName.none { it in invalidChars }
    }
}
