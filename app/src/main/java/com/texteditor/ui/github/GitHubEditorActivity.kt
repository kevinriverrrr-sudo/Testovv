package com.texteditor.ui.github

import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.texteditor.R
import com.texteditor.databinding.ActivityGithubEditorBinding
import com.texteditor.utils.SyntaxHighlighter

class GitHubEditorActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGithubEditorBinding
    private val viewModel: GitHubViewModel by viewModels()
    private var fileName: String? = null
    private var filePath: String? = null
    private var fileSha: String? = null
    private var originalContent: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGithubEditorBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        fileName = intent.getStringExtra("file_name")
        filePath = intent.getStringExtra("file_path")
        fileSha = intent.getStringExtra("file_sha")

        supportActionBar?.title = fileName

        observeViewModel()
        loadFileContent()
    }

    private fun observeViewModel() {
        viewModel.fileContent.observe(this) { content ->
            originalContent = content
            binding.editorText.setText(content)
            applySyntaxHighlighting()
        }

        viewModel.loading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) {
                android.view.View.VISIBLE
            } else {
                android.view.View.GONE
            }
        }

        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }

        viewModel.operationSuccess.observe(this) { message ->
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun loadFileContent() {
        filePath?.let { path ->
            val content = com.texteditor.data.models.GitHubContent(
                name = fileName ?: "",
                path = path,
                sha = fileSha ?: "",
                size = 0,
                type = "file",
                downloadUrl = null,
                content = null,
                encoding = null
            )
            viewModel.loadFileContent(content)
        }
    }

    private fun applySyntaxHighlighting() {
        val extension = fileName?.let { SyntaxHighlighter.getFileExtension(it) } ?: ""
        if (extension.isNotEmpty()) {
            val text = binding.editorText.text.toString()
            val highlighted = SyntaxHighlighter.highlight(text, extension, false)
            
            val selection = binding.editorText.selectionStart
            binding.editorText.setText(highlighted)
            binding.editorText.setSelection(minOf(selection, highlighted.length))
        }
    }

    private fun commitChanges() {
        val currentContent = binding.editorText.text.toString()
        
        if (currentContent == originalContent) {
            Toast.makeText(this, "No changes to commit", Toast.LENGTH_SHORT).show()
            return
        }

        showCommitDialog()
    }

    private fun showCommitDialog() {
        val input = TextInputEditText(this)
        input.hint = "Commit message"

        MaterialAlertDialogBuilder(this)
            .setTitle("Commit Changes")
            .setMessage("Enter a commit message for your changes:")
            .setView(input)
            .setPositiveButton("Commit") { _, _ ->
                val message = input.text.toString().trim()
                if (message.isNotEmpty()) {
                    val content = binding.editorText.text.toString()
                    filePath?.let { path ->
                        viewModel.commitFile(path, content, message, fileSha)
                    }
                } else {
                    Toast.makeText(this, "Commit message cannot be empty", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.github_editor_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            R.id.action_commit -> {
                commitChanges()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val currentContent = binding.editorText.text.toString()
        if (currentContent != originalContent) {
            MaterialAlertDialogBuilder(this)
                .setTitle("Unsaved Changes")
                .setMessage("You have unsaved changes. Do you want to discard them?")
                .setPositiveButton("Discard") { _, _ ->
                    super.onBackPressed()
                }
                .setNegativeButton("Cancel", null)
                .show()
        } else {
            super.onBackPressed()
        }
    }
}
