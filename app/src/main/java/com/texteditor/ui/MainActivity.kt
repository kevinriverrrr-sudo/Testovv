package com.texteditor.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.tabs.TabLayout
import com.google.android.material.textfield.TextInputEditText
import com.texteditor.R
import com.texteditor.databinding.ActivityMainBinding
import com.texteditor.ui.editor.EditorActivity
import com.texteditor.ui.files.FileAdapter
import com.texteditor.ui.files.FilesViewModel
import com.texteditor.ui.github.GitHubAuthActivity
import com.texteditor.ui.settings.SettingsActivity
import com.texteditor.utils.PreferencesManager
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val filesViewModel: FilesViewModel by viewModels()
    private lateinit var fileAdapter: FileAdapter
    private lateinit var recentAdapter: FileAdapter
    private lateinit var preferencesManager: PreferencesManager

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            setupUI()
        } else {
            showPermissionDeniedDialog()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        preferencesManager = PreferencesManager(this)
        lifecycleScope.launch {
            preferencesManager.themeMode.collect { mode ->
                applyTheme(mode)
            }
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        
        checkPermissions()
    }

    private fun checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            setupUI()
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            when {
                ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED -> {
                    setupUI()
                }
                shouldShowRequestPermissionRationale(Manifest.permission.READ_EXTERNAL_STORAGE) -> {
                    showPermissionRationaleDialog()
                }
                else -> {
                    requestPermissionLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
                }
            }
        } else {
            setupUI()
        }
    }

    private fun setupUI() {
        setupTabs()
        setupRecyclerViews()
        setupFab()
        observeViewModel()
    }

    private fun setupTabs() {
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                when (tab?.position) {
                    0 -> showFilesView()
                    1 -> showRecentView()
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }

    private fun setupRecyclerViews() {
        fileAdapter = FileAdapter(
            onItemClick = { fileItem ->
                if (fileItem.isDirectory) {
                    filesViewModel.navigateToDirectory(fileItem.path)
                } else {
                    openFile(fileItem.path)
                }
            },
            onItemLongClick = { fileItem ->
                showFileOptionsDialog(fileItem.path, fileItem.name)
            }
        )

        recentAdapter = FileAdapter(
            onItemClick = { fileItem ->
                openFile(fileItem.path)
            },
            onItemLongClick = { fileItem ->
                showFileOptionsDialog(fileItem.path, fileItem.name)
            }
        )

        binding.filesRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = fileAdapter
        }

        binding.recentRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = recentAdapter
        }
    }

    private fun setupFab() {
        binding.fab.setOnClickListener {
            showCreateDialog()
        }
    }

    private fun observeViewModel() {
        filesViewModel.files.observe(this) { files ->
            fileAdapter.submitList(files)
        }

        filesViewModel.recentFiles.observe(this) { files ->
            recentAdapter.submitList(files)
        }

        filesViewModel.currentPath.observe(this) { path ->
            supportActionBar?.subtitle = path
        }

        filesViewModel.error.observe(this) { error ->
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
        }

        filesViewModel.operationSuccess.observe(this) { message ->
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        }
    }

    private fun showFilesView() {
        binding.filesRecyclerView.visibility = android.view.View.VISIBLE
        binding.recentRecyclerView.visibility = android.view.View.GONE
    }

    private fun showRecentView() {
        binding.filesRecyclerView.visibility = android.view.View.GONE
        binding.recentRecyclerView.visibility = android.view.View.VISIBLE
    }

    private fun openFile(path: String) {
        val intent = Intent(this, EditorActivity::class.java).apply {
            putExtra("file_path", path)
        }
        startActivity(intent)
    }

    private fun showCreateDialog() {
        val options = arrayOf("New File", "New Folder")
        MaterialAlertDialogBuilder(this)
            .setTitle("Create New")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> showCreateFileDialog()
                    1 -> showCreateFolderDialog()
                }
            }
            .show()
    }

    private fun showCreateFileDialog() {
        val input = TextInputEditText(this)
        input.hint = "File name (e.g., file.txt)"

        MaterialAlertDialogBuilder(this)
            .setTitle("Create New File")
            .setView(input)
            .setPositiveButton("Create") { _, _ ->
                val fileName = input.text.toString().trim()
                if (fileName.isNotEmpty()) {
                    filesViewModel.createNewFile(fileName)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showCreateFolderDialog() {
        val input = TextInputEditText(this)
        input.hint = "Folder name"

        MaterialAlertDialogBuilder(this)
            .setTitle("Create New Folder")
            .setView(input)
            .setPositiveButton("Create") { _, _ ->
                val folderName = input.text.toString().trim()
                if (folderName.isNotEmpty()) {
                    filesViewModel.createNewFolder(folderName)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showFileOptionsDialog(path: String, name: String) {
        val options = arrayOf("Rename", "Duplicate", "Delete")
        MaterialAlertDialogBuilder(this)
            .setTitle(name)
            .setItems(options) { _, which ->
                when (which) {
                    0 -> showRenameDialog(path, name)
                    1 -> filesViewModel.duplicateFile(path)
                    2 -> showDeleteConfirmDialog(path, name)
                }
            }
            .show()
    }

    private fun showRenameDialog(path: String, currentName: String) {
        val input = TextInputEditText(this)
        input.setText(currentName)

        MaterialAlertDialogBuilder(this)
            .setTitle("Rename")
            .setView(input)
            .setPositiveButton("Rename") { _, _ ->
                val newName = input.text.toString().trim()
                if (newName.isNotEmpty()) {
                    filesViewModel.renameFile(path, newName)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showDeleteConfirmDialog(path: String, name: String) {
        MaterialAlertDialogBuilder(this)
            .setTitle("Delete File")
            .setMessage("Are you sure you want to delete \"$name\"?")
            .setPositiveButton("Delete") { _, _ ->
                filesViewModel.deleteFile(path)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showPermissionRationaleDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Storage Permission Required")
            .setMessage("This app needs storage permission to access and edit files.")
            .setPositiveButton("Grant") { _, _ ->
                requestPermissionLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
            .setNegativeButton("Cancel") { _, _ ->
                finish()
            }
            .show()
    }

    private fun showPermissionDeniedDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Permission Denied")
            .setMessage("Storage permission is required to use this app. Please grant it in settings.")
            .setPositiveButton("OK") { _, _ ->
                finish()
            }
            .show()
    }

    private fun applyTheme(mode: Int) {
        when (mode) {
            1 -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            2 -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            else -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_github -> {
                startActivity(Intent(this, GitHubAuthActivity::class.java))
                true
            }
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            R.id.action_navigate_up -> {
                filesViewModel.navigateUp()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val currentTab = binding.tabLayout.selectedTabPosition
        if (currentTab == 0) {
            filesViewModel.navigateUp()
        } else {
            super.onBackPressed()
        }
    }
}
