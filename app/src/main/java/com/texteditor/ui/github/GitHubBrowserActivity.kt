package com.texteditor.ui.github

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.texteditor.R
import com.texteditor.databinding.ActivityGithubBrowserBinding
import com.texteditor.ui.github.adapters.GitHubContentAdapter

class GitHubBrowserActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGithubBrowserBinding
    private val viewModel: GitHubViewModel by viewModels()
    private lateinit var contentAdapter: GitHubContentAdapter
    private var currentRepoName: String? = null
    private var currentRepoFullName: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGithubBrowserBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        currentRepoName = intent.getStringExtra("repo_name")
        currentRepoFullName = intent.getStringExtra("repo_full_name")
        val defaultBranch = intent.getStringExtra("default_branch") ?: "main"

        supportActionBar?.title = currentRepoName

        setupRecyclerView()
        observeViewModel()
        
        currentRepoFullName?.let { fullName ->
            val parts = fullName.split("/")
            if (parts.size == 2) {
                val repo = com.texteditor.data.models.GitHubRepo(
                    id = 0,
                    name = currentRepoName ?: "",
                    fullName = fullName,
                    description = null,
                    private = false,
                    htmlUrl = "",
                    cloneUrl = "",
                    defaultBranch = defaultBranch,
                    updatedAt = ""
                )
                viewModel.selectRepository(repo)
            }
        }
    }

    private fun setupRecyclerView() {
        contentAdapter = GitHubContentAdapter { content ->
            if (content.type == "dir") {
                viewModel.loadRepoContents(content.path)
            } else {
                openFileEditor(content)
            }
        }

        binding.contentRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@GitHubBrowserActivity)
            adapter = contentAdapter
        }
    }

    private fun observeViewModel() {
        viewModel.contents.observe(this) { contents ->
            contentAdapter.submitList(contents)
            binding.emptyView.visibility = if (contents.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.loading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }

        viewModel.operationSuccess.observe(this) { message ->
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        }
    }

    private fun openFileEditor(content: com.texteditor.data.models.GitHubContent) {
        val intent = Intent(this, GitHubEditorActivity::class.java)
        intent.putExtra("file_name", content.name)
        intent.putExtra("file_path", content.path)
        intent.putExtra("file_sha", content.sha)
        startActivity(intent)
    }

    private fun showBranchDialog() {
        viewModel.branches.value?.let { branches ->
            val branchNames = branches.map { it.name }.toTypedArray()
            val currentBranch = viewModel.getCurrentBranch()
            val selectedIndex = branches.indexOfFirst { it.name == currentBranch }

            MaterialAlertDialogBuilder(this)
                .setTitle("Select Branch")
                .setSingleChoiceItems(branchNames, selectedIndex) { dialog, which ->
                    viewModel.switchBranch(branches[which].name)
                    dialog.dismiss()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    private fun showCommitHistoryDialog() {
        viewModel.loadCommits()
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Recent Commits")
            .setMessage("Loading commits...")
            .setPositiveButton("OK", null)
            .show()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.github_browser_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            R.id.action_branches -> {
                showBranchDialog()
                true
            }
            R.id.action_commits -> {
                showCommitHistoryDialog()
                true
            }
            R.id.action_navigate_up -> {
                viewModel.navigateUp()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
