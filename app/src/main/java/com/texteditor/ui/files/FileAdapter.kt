package com.texteditor.ui.files

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.texteditor.databinding.ItemFileBinding
import com.texteditor.data.models.FileItem
import com.texteditor.utils.FileUtils

class FileAdapter(
    private val onItemClick: (FileItem) -> Unit,
    private val onItemLongClick: (FileItem) -> Unit
) : ListAdapter<FileItem, FileAdapter.FileViewHolder>(FileDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
        val binding = ItemFileBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return FileViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class FileViewHolder(
        private val binding: ItemFileBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(fileItem: FileItem) {
            binding.apply {
                fileName.text = fileItem.name
                
                if (fileItem.isDirectory) {
                    fileIcon.setImageResource(android.R.drawable.ic_menu_view)
                    fileSize.text = "Folder"
                } else {
                    fileIcon.setImageResource(android.R.drawable.ic_menu_edit)
                    fileSize.text = FileUtils.formatFileSize(fileItem.size)
                }
                
                fileDate.text = FileUtils.formatDate(fileItem.lastModified)

                root.setOnClickListener {
                    onItemClick(fileItem)
                }

                root.setOnLongClickListener {
                    onItemLongClick(fileItem)
                    true
                }
            }
        }
    }

    private class FileDiffCallback : DiffUtil.ItemCallback<FileItem>() {
        override fun areItemsTheSame(oldItem: FileItem, newItem: FileItem): Boolean {
            return oldItem.path == newItem.path
        }

        override fun areContentsTheSame(oldItem: FileItem, newItem: FileItem): Boolean {
            return oldItem == newItem
        }
    }
}
