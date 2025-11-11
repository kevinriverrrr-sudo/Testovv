package com.texteditor.ui.editor

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.texteditor.R
import com.texteditor.databinding.ActivityEditorBinding
import com.texteditor.utils.PreferencesManager
import com.texteditor.utils.SyntaxHighlighter
import kotlinx.coroutines.launch

class EditorActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditorBinding
    private val viewModel: EditorViewModel by viewModels()
    private lateinit var preferencesManager: PreferencesManager
    private var autoSaveHandler: Handler? = null
    private var autoSaveRunnable: Runnable? = null
    private var currentFilePath: String? = null
    private var isDarkMode = false
    private var syntaxHighlightingEnabled = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditorBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        preferencesManager = PreferencesManager(this)
        
        currentFilePath = intent.getStringExtra("file_path")
        
        setupEditor()
        observeViewModel()
        loadPreferences()
        
        currentFilePath?.let { path ->
            viewModel.loadFile(path)
            supportActionBar?.title = java.io.File(path).name
        }
    }

    private fun setupEditor() {
        binding.editorText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            
            override fun afterTextChanged(s: Editable?) {
                s?.let { text ->
                    viewModel.updateContent(text.toString())
                    scheduleAutoSave()
                }
            }
        })
    }

    private fun observeViewModel() {
        viewModel.content.observe(this) { content ->
            if (binding.editorText.text.toString() != content) {
                val selection = binding.editorText.selectionStart
                binding.editorText.setText(content)
                applySyntaxHighlighting()
                binding.editorText.setSelection(minOf(selection, content.length))
            }
        }

        viewModel.saveStatus.observe(this) { status ->
            when (status) {
                is EditorViewModel.SaveStatus.Saving -> {
                    supportActionBar?.subtitle = "Saving..."
                }
                is EditorViewModel.SaveStatus.Saved -> {
                    supportActionBar?.subtitle = "Saved"
                }
                is EditorViewModel.SaveStatus.Error -> {
                    supportActionBar?.subtitle = "Error"
                    Toast.makeText(this, status.message, Toast.LENGTH_LONG).show()
                }
                else -> {}
            }
        }

        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }
    }

    private fun loadPreferences() {
        lifecycleScope.launch {
            preferencesManager.fontSize.collect { size ->
                binding.editorText.textSize = size.toFloat()
            }
        }

        lifecycleScope.launch {
            preferencesManager.lineNumbers.collect { enabled ->
                binding.lineNumbers.visibility = if (enabled) {
                    android.view.View.VISIBLE
                } else {
                    android.view.View.GONE
                }
                updateLineNumbers()
            }
        }

        lifecycleScope.launch {
            preferencesManager.syntaxHighlighting.collect { enabled ->
                syntaxHighlightingEnabled = enabled
                if (enabled) {
                    applySyntaxHighlighting()
                }
            }
        }

        lifecycleScope.launch {
            preferencesManager.themeMode.collect { mode ->
                isDarkMode = mode == 2
                if (syntaxHighlightingEnabled) {
                    applySyntaxHighlighting()
                }
            }
        }
    }

    private fun applySyntaxHighlighting() {
        if (!syntaxHighlightingEnabled) return
        
        val fileName = currentFilePath?.let { java.io.File(it).name } ?: ""
        val extension = SyntaxHighlighter.getFileExtension(fileName)
        
        if (extension.isNotEmpty()) {
            val text = binding.editorText.text.toString()
            val highlighted = SyntaxHighlighter.highlight(text, extension, isDarkMode)
            
            val selection = binding.editorText.selectionStart
            binding.editorText.setText(highlighted)
            binding.editorText.setSelection(minOf(selection, highlighted.length))
        }
    }

    private fun updateLineNumbers() {
        val lines = binding.editorText.text.toString().split("\n").size
        val lineNumbersText = (1..lines).joinToString("\n")
        binding.lineNumbers.text = lineNumbersText
    }

    private fun scheduleAutoSave() {
        autoSaveHandler?.removeCallbacks(autoSaveRunnable ?: return)
        
        autoSaveHandler = Handler(Looper.getMainLooper())
        autoSaveRunnable = Runnable {
            viewModel.autoSave(binding.editorText.text.toString())
        }
        
        autoSaveHandler?.postDelayed(autoSaveRunnable!!, 3000)
    }

    private fun saveFile() {
        val content = binding.editorText.text.toString()
        viewModel.saveFile(content)
    }

    private fun showFindDialog() {
        val searchView = SearchView(this)
        searchView.queryHint = "Find text"
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Find")
            .setView(searchView)
            .setPositiveButton("Find") { _, _ ->
                val query = searchView.query.toString()
                findText(query)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showReplaceDialog() {
        val view = layoutInflater.inflate(R.layout.dialog_find_replace, null)
        val findInput = view.findViewById<TextInputEditText>(R.id.findInput)
        val replaceInput = view.findViewById<TextInputEditText>(R.id.replaceInput)

        MaterialAlertDialogBuilder(this)
            .setTitle("Find and Replace")
            .setView(view)
            .setPositiveButton("Replace All") { _, _ ->
                val findText = findInput.text.toString()
                val replaceText = replaceInput.text.toString()
                if (findText.isNotEmpty()) {
                    replaceAllText(findText, replaceText)
                }
            }
            .setNeutralButton("Find") { _, _ ->
                val findText = findInput.text.toString()
                if (findText.isNotEmpty()) {
                    findText(findText)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun findText(query: String) {
        val text = binding.editorText.text.toString()
        val index = text.indexOf(query, binding.editorText.selectionStart)
        
        if (index >= 0) {
            binding.editorText.setSelection(index, index + query.length)
            binding.editorText.requestFocus()
        } else {
            Toast.makeText(this, "Text not found", Toast.LENGTH_SHORT).show()
        }
    }

    private fun replaceAllText(findText: String, replaceText: String) {
        val text = binding.editorText.text.toString()
        val newText = text.replace(findText, replaceText)
        binding.editorText.setText(newText)
        
        val count = (text.length - newText.length) / (findText.length - replaceText.length)
        Toast.makeText(this, "Replaced $count occurrences", Toast.LENGTH_SHORT).show()
    }

    private fun increaseFontSize() {
        lifecycleScope.launch {
            val currentSize = preferencesManager.fontSize.first()
            val newSize = minOf(currentSize + 2, 32)
            preferencesManager.saveFontSize(newSize)
        }
    }

    private fun decreaseFontSize() {
        lifecycleScope.launch {
            val currentSize = preferencesManager.fontSize.first()
            val newSize = maxOf(currentSize - 2, 8)
            preferencesManager.saveFontSize(newSize)
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.editor_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            R.id.action_save -> {
                saveFile()
                true
            }
            R.id.action_undo -> {
                viewModel.undo()
                true
            }
            R.id.action_redo -> {
                viewModel.redo()
                true
            }
            R.id.action_find -> {
                showFindDialog()
                true
            }
            R.id.action_replace -> {
                showReplaceDialog()
                true
            }
            R.id.action_increase_font -> {
                increaseFontSize()
                true
            }
            R.id.action_decrease_font -> {
                decreaseFontSize()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onPause() {
        super.onPause()
        if (viewModel.isModified()) {
            saveFile()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        autoSaveHandler?.removeCallbacks(autoSaveRunnable ?: return)
    }
}
