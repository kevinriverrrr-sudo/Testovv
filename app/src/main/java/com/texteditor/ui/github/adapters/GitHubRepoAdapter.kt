package com.texteditor.ui.github.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.texteditor.databinding.ItemGithubRepoBinding
import com.texteditor.data.models.GitHubRepo

class GitHubRepoAdapter(
    private val onItemClick: (GitHubRepo) -> Unit
) : ListAdapter<GitHubRepo, GitHubRepoAdapter.RepoViewHolder>(RepoDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RepoViewHolder {
        val binding = ItemGithubRepoBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RepoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RepoViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RepoViewHolder(
        private val binding: ItemGithubRepoBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(repo: GitHubRepo) {
            binding.apply {
                repoName.text = repo.name
                repoDescription.text = repo.description ?: "No description"
                repoVisibility.text = if (repo.private) "Private" else "Public"

                root.setOnClickListener {
                    onItemClick(repo)
                }
            }
        }
    }

    private class RepoDiffCallback : DiffUtil.ItemCallback<GitHubRepo>() {
        override fun areItemsTheSame(oldItem: GitHubRepo, newItem: GitHubRepo): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: GitHubRepo, newItem: GitHubRepo): Boolean {
            return oldItem == newItem
        }
    }
}
