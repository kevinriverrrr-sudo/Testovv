package com.texteditor.utils

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class PreferencesManager(private val context: Context) {

    companion object {
        private val GITHUB_TOKEN = stringPreferencesKey("github_token")
        private val THEME_MODE = intPreferencesKey("theme_mode")
        private val FONT_SIZE = intPreferencesKey("font_size")
        private val AUTO_SAVE = booleanPreferencesKey("auto_save")
        private val LINE_NUMBERS = booleanPreferencesKey("line_numbers")
        private val SYNTAX_HIGHLIGHTING = booleanPreferencesKey("syntax_highlighting")
        private val LAST_DIRECTORY = stringPreferencesKey("last_directory")
    }

    val githubToken: Flow<String?> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[GITHUB_TOKEN]
        }

    val themeMode: Flow<Int> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[THEME_MODE] ?: 0
        }

    val fontSize: Flow<Int> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[FONT_SIZE] ?: 14
        }

    val autoSave: Flow<Boolean> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[AUTO_SAVE] ?: true
        }

    val lineNumbers: Flow<Boolean> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[LINE_NUMBERS] ?: true
        }

    val syntaxHighlighting: Flow<Boolean> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[SYNTAX_HIGHLIGHTING] ?: true
        }

    val lastDirectory: Flow<String?> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[LAST_DIRECTORY]
        }

    suspend fun saveGithubToken(token: String?) {
        context.dataStore.edit { preferences ->
            if (token != null) {
                preferences[GITHUB_TOKEN] = token
            } else {
                preferences.remove(GITHUB_TOKEN)
            }
        }
    }

    suspend fun saveThemeMode(mode: Int) {
        context.dataStore.edit { preferences ->
            preferences[THEME_MODE] = mode
        }
    }

    suspend fun saveFontSize(size: Int) {
        context.dataStore.edit { preferences ->
            preferences[FONT_SIZE] = size
        }
    }

    suspend fun saveAutoSave(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[AUTO_SAVE] = enabled
        }
    }

    suspend fun saveLineNumbers(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[LINE_NUMBERS] = enabled
        }
    }

    suspend fun saveSyntaxHighlighting(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[SYNTAX_HIGHLIGHTING] = enabled
        }
    }

    suspend fun saveLastDirectory(directory: String) {
        context.dataStore.edit { preferences ->
            preferences[LAST_DIRECTORY] = directory
        }
    }

    suspend fun clearAll() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
