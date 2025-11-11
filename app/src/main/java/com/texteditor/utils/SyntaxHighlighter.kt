package com.texteditor.utils

import android.graphics.Color
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import java.util.regex.Pattern

object SyntaxHighlighter {

    private val JAVA_KEYWORDS = arrayOf(
        "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class",
        "const", "continue", "default", "do", "double", "else", "enum", "extends", "final",
        "finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int",
        "interface", "long", "native", "new", "package", "private", "protected", "public",
        "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this",
        "throw", "throws", "transient", "try", "void", "volatile", "while"
    )

    private val KOTLIN_KEYWORDS = arrayOf(
        "abstract", "actual", "annotation", "as", "break", "by", "catch", "class", "companion",
        "const", "constructor", "continue", "crossinline", "data", "delegate", "do", "dynamic",
        "else", "enum", "expect", "external", "false", "field", "file", "final", "finally",
        "for", "fun", "get", "if", "import", "in", "infix", "init", "inline", "inner",
        "interface", "internal", "is", "it", "lateinit", "noinline", "null", "object", "open",
        "operator", "out", "override", "package", "param", "private", "property", "protected",
        "public", "receiver", "reified", "return", "sealed", "set", "setparam", "super",
        "suspend", "tailrec", "this", "throw", "true", "try", "typealias", "typeof", "val",
        "var", "vararg", "when", "where", "while"
    )

    private val PYTHON_KEYWORDS = arrayOf(
        "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class",
        "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global",
        "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
        "return", "try", "while", "with", "yield"
    )

    private val JSON_KEYWORDS = arrayOf("true", "false", "null")

    private val XML_KEYWORDS = arrayOf(
        "version", "encoding", "xmlns", "android", "tools", "app"
    )

    data class SyntaxColors(
        val keyword: Int = Color.rgb(204, 120, 50),
        val string: Int = Color.rgb(106, 135, 89),
        val comment: Int = Color.rgb(128, 128, 128),
        val number: Int = Color.rgb(104, 151, 187),
        val function: Int = Color.rgb(220, 220, 170)
    )

    fun highlight(text: String, fileExtension: String, isDarkMode: Boolean = false): Spannable {
        val spannable = SpannableString(text)
        
        val colors = if (isDarkMode) {
            SyntaxColors(
                keyword = Color.rgb(86, 156, 214),
                string = Color.rgb(206, 145, 120),
                comment = Color.rgb(106, 153, 85),
                number = Color.rgb(181, 206, 168),
                function = Color.rgb(220, 220, 170)
            )
        } else {
            SyntaxColors()
        }

        when (fileExtension.lowercase()) {
            "java" -> highlightJava(spannable, colors)
            "kt", "kts" -> highlightKotlin(spannable, colors)
            "py" -> highlightPython(spannable, colors)
            "json" -> highlightJson(spannable, colors)
            "xml" -> highlightXml(spannable, colors)
            "md" -> highlightMarkdown(spannable, colors)
            else -> return spannable
        }

        return spannable
    }

    private fun highlightJava(spannable: Spannable, colors: SyntaxColors) {
        highlightKeywords(spannable, JAVA_KEYWORDS, colors.keyword)
        highlightStrings(spannable, colors.string)
        highlightComments(spannable, colors.comment)
        highlightNumbers(spannable, colors.number)
    }

    private fun highlightKotlin(spannable: Spannable, colors: SyntaxColors) {
        highlightKeywords(spannable, KOTLIN_KEYWORDS, colors.keyword)
        highlightStrings(spannable, colors.string)
        highlightComments(spannable, colors.comment)
        highlightNumbers(spannable, colors.number)
    }

    private fun highlightPython(spannable: Spannable, colors: SyntaxColors) {
        highlightKeywords(spannable, PYTHON_KEYWORDS, colors.keyword)
        highlightStrings(spannable, colors.string)
        highlightPythonComments(spannable, colors.comment)
        highlightNumbers(spannable, colors.number)
    }

    private fun highlightJson(spannable: Spannable, colors: SyntaxColors) {
        highlightKeywords(spannable, JSON_KEYWORDS, colors.keyword)
        highlightStrings(spannable, colors.string)
        highlightNumbers(spannable, colors.number)
    }

    private fun highlightXml(spannable: Spannable, colors: SyntaxColors) {
        highlightXmlTags(spannable, colors.keyword)
        highlightStrings(spannable, colors.string)
        highlightXmlComments(spannable, colors.comment)
    }

    private fun highlightMarkdown(spannable: Spannable, colors: SyntaxColors) {
        highlightMarkdownHeaders(spannable, colors.keyword)
        highlightMarkdownCode(spannable, colors.string)
    }

    private fun highlightKeywords(spannable: Spannable, keywords: Array<String>, color: Int) {
        val text = spannable.toString()
        for (keyword in keywords) {
            val pattern = Pattern.compile("\\b$keyword\\b")
            val matcher = pattern.matcher(text)
            while (matcher.find()) {
                spannable.setSpan(
                    ForegroundColorSpan(color),
                    matcher.start(),
                    matcher.end(),
                    Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
                )
            }
        }
    }

    private fun highlightStrings(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("\"([^\"]|\\\\.)*\"|'([^']|\\\\.)*'")
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightComments(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val singleLinePattern = Pattern.compile("//.*")
        val multiLinePattern = Pattern.compile("/\\*.*?\\*/", Pattern.DOTALL)
        
        var matcher = singleLinePattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
        
        matcher = multiLinePattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightPythonComments(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("#.*")
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightNumbers(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("\\b\\d+(\\.\\d+)?\\b")
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightXmlTags(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("</?[\\w:]+|/>|>")
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightXmlComments(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("<!--.*?-->", Pattern.DOTALL)
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightMarkdownHeaders(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("^#+.*$", Pattern.MULTILINE)
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    private fun highlightMarkdownCode(spannable: Spannable, color: Int) {
        val text = spannable.toString()
        val pattern = Pattern.compile("`[^`]+`|```[^`]+```", Pattern.DOTALL)
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            spannable.setSpan(
                ForegroundColorSpan(color),
                matcher.start(),
                matcher.end(),
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
    }

    fun getFileExtension(fileName: String): String {
        val dotIndex = fileName.lastIndexOf('.')
        return if (dotIndex > 0 && dotIndex < fileName.length - 1) {
            fileName.substring(dotIndex + 1)
        } else {
            ""
        }
    }
}
