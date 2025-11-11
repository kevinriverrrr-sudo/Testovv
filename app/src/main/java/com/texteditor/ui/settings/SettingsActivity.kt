package com.texteditor.ui.settings

import android.os.Bundle
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.lifecycle.lifecycleScope
import com.texteditor.databinding.ActivitySettingsBinding
import com.texteditor.utils.PreferencesManager
import kotlinx.coroutines.launch

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding
    private lateinit var preferencesManager: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Settings"

        preferencesManager = PreferencesManager(this)
        
        loadSettings()
        setupListeners()
    }

    private fun loadSettings() {
        lifecycleScope.launch {
            preferencesManager.themeMode.collect { mode ->
                binding.themeRadioGroup.check(
                    when (mode) {
                        1 -> binding.lightThemeRadio.id
                        2 -> binding.darkThemeRadio.id
                        else -> binding.systemThemeRadio.id
                    }
                )
            }
        }

        lifecycleScope.launch {
            preferencesManager.fontSize.collect { size ->
                binding.fontSizeSeekBar.progress = size - 8
                binding.fontSizeValue.text = "$size sp"
            }
        }

        lifecycleScope.launch {
            preferencesManager.autoSave.collect { enabled ->
                binding.autoSaveSwitch.isChecked = enabled
            }
        }

        lifecycleScope.launch {
            preferencesManager.lineNumbers.collect { enabled ->
                binding.lineNumbersSwitch.isChecked = enabled
            }
        }

        lifecycleScope.launch {
            preferencesManager.syntaxHighlighting.collect { enabled ->
                binding.syntaxHighlightingSwitch.isChecked = enabled
            }
        }
    }

    private fun setupListeners() {
        binding.themeRadioGroup.setOnCheckedChangeListener { _, checkedId ->
            val mode = when (checkedId) {
                binding.lightThemeRadio.id -> 1
                binding.darkThemeRadio.id -> 2
                else -> 0
            }
            lifecycleScope.launch {
                preferencesManager.saveThemeMode(mode)
                applyTheme(mode)
            }
        }

        binding.fontSizeSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val fontSize = progress + 8
                binding.fontSizeValue.text = "$fontSize sp"
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                val fontSize = (seekBar?.progress ?: 6) + 8
                lifecycleScope.launch {
                    preferencesManager.saveFontSize(fontSize)
                }
            }
        })

        binding.autoSaveSwitch.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                preferencesManager.saveAutoSave(isChecked)
            }
        }

        binding.lineNumbersSwitch.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                preferencesManager.saveLineNumbers(isChecked)
            }
        }

        binding.syntaxHighlightingSwitch.setOnCheckedChangeListener { _, isChecked ->
            lifecycleScope.launch {
                preferencesManager.saveSyntaxHighlighting(isChecked)
            }
        }
    }

    private fun applyTheme(mode: Int) {
        when (mode) {
            1 -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            2 -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            else -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
