package com.texteditor.ui.github

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.texteditor.R
import com.texteditor.databinding.ActivityGithubAuthBinding
import com.texteditor.ui.github.adapters.GitHubRepoAdapter

class GitHubAuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGithubAuthBinding
    private val viewModel: GitHubViewModel by viewModels()
    private lateinit var repoAdapter: GitHubRepoAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGithubAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "GitHub"

        setupRecyclerView()
        setupButtons()
        observeViewModel()
    }

    private fun setupRecyclerView() {
        repoAdapter = GitHubRepoAdapter { repo ->
            val intent = Intent(this, GitHubBrowserActivity::class.java)
            intent.putExtra("repo_name", repo.name)
            intent.putExtra("repo_full_name", repo.fullName)
            intent.putExtra("default_branch", repo.defaultBranch)
            startActivity(intent)
        }

        binding.reposRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@GitHubAuthActivity)
            adapter = repoAdapter
        }
    }

    private fun setupButtons() {
        binding.loginButton.setOnClickListener {
            showLoginDialog()
        }

        binding.logoutButton.setOnClickListener {
            viewModel.logout()
        }

        binding.refreshButton.setOnClickListener {
            viewModel.loadRepositories()
        }
    }

    private fun observeViewModel() {
        viewModel.user.observe(this) { user ->
            if (user != null) {
                binding.loginLayout.visibility = View.GONE
                binding.userLayout.visibility = View.VISIBLE
                binding.userName.text = user.name ?: user.login
                binding.userEmail.text = user.email ?: "No email"
                binding.repoCount.text = "${user.publicRepos} repositories"
            } else {
                binding.loginLayout.visibility = View.VISIBLE
                binding.userLayout.visibility = View.GONE
            }
        }

        viewModel.repos.observe(this) { repos ->
            repoAdapter.submitList(repos)
            binding.emptyView.visibility = if (repos.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.loading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }
    }

    private fun showLoginDialog() {
        val input = TextInputEditText(this)
        input.hint = "GitHub Personal Access Token"

        MaterialAlertDialogBuilder(this)
            .setTitle("Login to GitHub")
            .setMessage("Enter your GitHub Personal Access Token.\nYou can create one at: Settings → Developer settings → Personal access tokens")
            .setView(input)
            .setPositiveButton("Login") { _, _ ->
                val token = input.text.toString().trim()
                if (token.isNotEmpty()) {
                    viewModel.saveToken(token)
                } else {
                    Toast.makeText(this, "Token cannot be empty", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
