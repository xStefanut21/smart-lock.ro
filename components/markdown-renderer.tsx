"use client";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): string => {
    let html = text;
    
    // Handle images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg border border-neutral-800" /></div>');
    
    // Handle headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mb-3 mt-5">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-6">$1</h1>');
    
    // Handle bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Handle italic
    html = html.replace(/\*(.+?)\*/g, '<em class="text-neutral-200 italic">$1</em>');
    
    // Handle links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-neutral-300 mb-4 leading-relaxed">');
    
    // Handle lists
    html = html.replace(/^- (.+)$/gim, '<li class="text-neutral-300">$1</li>');
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside text-neutral-300 mb-4 space-y-1">$1</ul>');
    
    // Handle code blocks
    html = html.replace(/```(.*?)```/g, '<pre class="bg-neutral-900 p-4 rounded-lg overflow-x-auto mb-4 border border-neutral-800"><code class="text-sm text-neutral-300">$1</code></pre>');
    
    // Handle inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-sm text-red-400">$1</code>');
    
    // Wrap in paragraphs
    if (!html.startsWith('<h') && !html.startsWith('<div') && !html.startsWith('<ul') && !html.startsWith('<pre')) {
      html = '<p class="text-neutral-300 mb-4 leading-relaxed">' + html + '</p>';
    }
    
    return html;
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </div>
  );
}
