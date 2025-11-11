package com.texteditor.ui.github.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.texteditor.databinding.ItemGithubContentBinding
import com.texteditor.data.models.GitHubContent

class GitHubContentAdapter(
    private val onItemClick: (GitHubContent) -> Unit
) : ListAdapter<GitHubContent, GitHubContentAdapter.ContentViewHolder>(ContentDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContentViewHolder {
        val binding = ItemGithubContentBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ContentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ContentViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ContentViewHolder(
        private val binding: ItemGithubContentBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(content: GitHubContent) {
            binding.apply {
                contentName.text = content.name
                contentType.text = if (content.type == "dir") "Folder" else "File"
                
                val icon = if (content.type == "dir") {
                    android.R.drawable.ic_menu_view
                } else {
                    android.R.drawable.ic_menu_edit
                }
                contentIcon.setImageResource(icon)

                root.setOnClickListener {
                    onItemClick(content)
                }
            }
        }
    }

    private class ContentDiffCallback : DiffUtil.ItemCallback<GitHubContent>() {
        override fun areItemsTheSame(oldItem: GitHubContent, newItem: GitHubContent): Boolean {
            return oldItem.sha == newItem.sha
        }

        override fun areContentsTheSame(oldItem: GitHubContent, newItem: GitHubContent): Boolean {
            return oldItem == newItem
        }
    }
}
