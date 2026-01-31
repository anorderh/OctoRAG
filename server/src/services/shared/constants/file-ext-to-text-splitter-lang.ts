import { SupportedTextSplitterLanguage } from "langchain/text_splitter";

export const fileExtToTextSplitterLang : {[key: string]: SupportedTextSplitterLanguage} = {
	'.cpp': 'cpp', // C++
	'.cxx': 'cpp', // C++
	'.hpp': 'cpp', // C++
	'.h': 'cpp',   // C++
	'.go': 'go', // Go
	'.java': 'java', // Java
	'.js': 'js', // JavaScript
	'.jsx': 'js', // JavaScript (JSX)
	'.php': 'php', // PHP
	'.phtml': 'php', // PHP
	'.proto': 'proto', // Protocol Buffers
	'.py': 'python', // Python
	'.rst': 'rst', // reStructuredText
	'.rb': 'ruby', // Ruby
	'.rs': 'rust', // Rust
	'.scala': 'scala', // Scala
	'.sc': 'scala', // Scala
	'.swift': 'swift', // Swift
	'.md': 'markdown', // Markdown
	'.markdown': 'markdown', // Markdown
	'.tex': 'latex', // LaTeX
	'.ltx': 'latex', // LaTeX
	'.html': 'html', // HTML
	'.htm': 'html', // HTML
	'.sol': 'sol' // Solidity
};