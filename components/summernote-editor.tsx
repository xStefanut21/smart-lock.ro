"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SummernoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    jQuery: any;
    $: any;
    summernote: any;
  }
}

export default function SummernoteEditor({ value, onChange, placeholder = "Introdu descrierea produsului..." }: SummernoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple timeout to prevent cursor jumping
  const handleChange = useCallback((content: string) => {
    setLocalValue(content);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout to update parent after user stops typing
    timeoutRef.current = setTimeout(() => {
      onChange(content);
    }, 300);
  }, [onChange]);

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('=== STARTING SUMMERNOTE LOADING ===');

    // Load jQuery
    console.log('Loading jQuery...');
    const jQueryScript = document.createElement('script');
    jQueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    jQueryScript.onload = () => {
      console.log('✅ jQuery loaded successfully');

      // Load Summernote CSS (lite version - no Bootstrap dependency)
      console.log('Loading Summernote CSS...');
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = '/summernote-editor/summernote-0.9.0-dist/summernote-lite.min.css';
      linkElement.onload = () => {
        console.log('✅ Summernote CSS loaded');
      };
      linkElement.onerror = (e) => {
        console.error('❌ Summernote CSS failed to load:', e);
      };
      document.head.appendChild(linkElement);

      // Load Summernote JS (lite version)
      console.log('Loading Summernote JS...');
      const scriptElement = document.createElement('script');
      scriptElement.src = '/summernote-editor/summernote-0.9.0-dist/summernote-lite.min.js';
      scriptElement.onload = () => {
        console.log('✅ Summernote JS loaded successfully');
        console.log('Setting isLoaded to true');
        setIsLoaded(true);
      };
      scriptElement.onerror = (e) => {
        console.error('❌ Summernote JS failed to load:', e);
      };
      document.body.appendChild(scriptElement);
    };

    jQueryScript.onerror = (e) => {
      console.error('❌ jQuery failed to load:', e);
    };

    document.body.appendChild(jQueryScript);

    console.log('=== SUMMERNOTE LOADING INITIATED ===');

    return () => {
      console.log('=== CLEANING UP SUMMERNOTE ===');
      // Cleanup
      if (document.body.contains(jQueryScript)) {
        document.body.removeChild(jQueryScript);
      }
      const linkElement = document.querySelector('link[href*="summernote"]');
      if (linkElement) {
        document.head.removeChild(linkElement);
      }
      const cssOverride = document.getElementById('summernote-override');
      if (cssOverride) {
        document.head.removeChild(cssOverride);
      }
      console.log('=== CLEANUP COMPLETE ===');
    };
  }, []);

  useEffect(() => {
    if (isLoaded && editorRef.current && window.jQuery && window.jQuery.summernote) {
      const $ = window.jQuery || window.$;
      
      if ($) {
        console.log('jQuery found:', $);
        console.log('summernote on jQuery:', !!$.summernote);
        
        if ($.summernote) {
          console.log('Initializing Summernote...');
          
          // Initialize Summernote with default toolbar
          $(editorRef.current).summernote({
            placeholder: placeholder,
            height: 300,
            minHeight: 200,
            maxHeight: 800,
            focus: false,
            dialogsInBody: true,
            dialogsFade: true,
            callbacks: {
              onChange: function(contents: string) {
                handleChange(contents);
              },
              onInit: function() {
                console.log('Summernote initialized');
                
                // Inject aggressive CSS to override Summernote defaults
                const cssOverride = document.createElement('style');
                cssOverride.id = 'summernote-override';
                cssOverride.innerHTML = `
                  .note-editable {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    min-height: 300px !important;
                    padding: 12px !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    line-height: 1.5 !important;
                    border: none !important;
                    outline: none !important;
                  }
                  .note-editable:focus {
                    outline: none !important;
                    box-shadow: none !important;
                  }
                  .note-editable * {
                    color: #000000 !important;
                  }
                  /* List formatting */
                  .note-editable ul {
                    list-style-type: disc !important;
                    margin-left: 20px !important;
                    margin-bottom: 12px !important;
                  }
                  .note-editable ol {
                    list-style-type: decimal !important;
                    margin-left: 20px !important;
                    margin-bottom: 12px !important;
                  }
                  .note-editable li {
                    margin-bottom: 4px !important;
                    line-height: 1.4 !important;
                  }
                  .note-editable ul ul,
                  .note-editable ol ol {
                    margin-left: 20px !important;
                  }
                  /* Text formatting */
                  .note-editable strong,
                  .note-editable b {
                    font-weight: bold !important;
                  }
                  .note-editable em,
                  .note-editable i {
                    font-style: italic !important;
                  }
                  .note-editable u {
                    text-decoration: underline !important;
                  }
                  .note-editable strike,
                  .note-editable s {
                    text-decoration: line-through !important;
                  }
                  /* Paragraph and headings */
                  .note-editable p {
                    margin-bottom: 12px !important;
                  }
                  .note-editable h1,
                  .note-editable h2,
                  .note-editable h3,
                  .note-editable h4,
                  .note-editable h5,
                  .note-editable h6 {
                    font-weight: bold !important;
                    margin-bottom: 8px !important;
                  }
                  .note-editable h1 { font-size: 2em !important; }
                  .note-editable h2 { font-size: 1.5em !important; }
                  .note-editable h3 { font-size: 1.17em !important; }
                  .note-editable h4 { font-size: 1em !important; }
                  .note-editable h5 { font-size: 0.83em !important; }
                  .note-editable h6 { font-size: 0.67em !important; }
                  /* Quote and code formatting */
                  .note-editable blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    padding-left: 16px !important;
                    margin: 16px 0 !important;
                    color: #374151 !important;
                    font-style: italic !important;
                    background-color: #f9fafb !important;
                    padding: 12px 16px !important;
                    border-radius: 4px !important;
                  }
                  .note-editable pre {
                    background-color: #1f2937 !important;
                    color: #f9fafb !important;
                    padding: 12px !important;
                    border-radius: 4px !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    overflow-x: auto !important;
                    margin: 12px 0 !important;
                    border: 1px solid #374151 !important;
                  }
                  .note-editable code {
                    background-color: #f3f4f6 !important;
                    color: #dc2626 !important;
                    padding: 2px 6px !important;
                    border-radius: 3px !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 0.9em !important;
                    border: 1px solid #d1d5db !important;
                  }
                  .note-editable pre code {
                    background-color: transparent !important;
                    color: inherit !important;
                    padding: 0 !important;
                    border: none !important;
                    font-size: inherit !important;
                  }
                  /* Modal text visibility - HIGH PRIORITY */
                  .note-modal,
                  .note-modal * {
                    color: #000000 !important;
                  }
                  .note-modal .modal-dialog .modal-content {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-header {
                    background-color: #f8f9fa !important;
                    color: #000000 !important;
                    border-bottom: 1px solid #dee2e6 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-header .modal-title {
                    color: #000000 !important;
                    font-weight: 600 !important;
                    font-size: 1.25rem !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body label {
                    color: #000000 !important;
                    font-weight: 500 !important;
                    margin-bottom: 0.5rem !important;
                    display: block !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .form-group {
                    margin-bottom: 1rem !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .form-control {
                    background-color: #ffffff !important;
                    border: 1px solid #d1d5db !important;
                    color: #000000 !important;
                    padding: 0.5rem 0.75rem !important;
                    border-radius: 0.375rem !important;
                    width: 100% !important;
                    font-size: 0.875rem !important;
                    line-height: 1.5 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .form-control:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                    outline: none !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .form-control::placeholder {
                    color: #6b7280 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .checkbox {
                    margin: 1rem 0 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .checkbox label {
                    color: #000000 !important;
                    font-weight: normal !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-body .checkbox input[type="checkbox"] {
                    margin-right: 0.5rem !important;
                    margin-top: 0 !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-footer {
                    background-color: #f8f9fa !important;
                    border-top: 1px solid #dee2e6 !important;
                    padding: 1rem !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-footer .btn {
                    color: #000000 !important;
                    background-color: #f8f9fa !important;
                    border: 1px solid #d1d5db !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 0.375rem !important;
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    margin-left: 0.5rem !important;
                    cursor: pointer !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-footer .btn:hover {
                    background-color: #e9ecef !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-footer .btn-primary {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                    color: #ffffff !important;
                  }
                  .note-modal .modal-dialog .modal-content .modal-footer .btn-primary:hover {
                    background-color: #2563eb !important;
                    border-color: #2563eb !important;
                  }
                  /* Link formatting in editor */
                  .note-editable a {
                    color: #3b82f6 !important;
                    text-decoration: underline !important;
                    cursor: pointer !important;
                  }
                  .note-editable a:hover {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                  }
                  /* Table formatting */
                  .note-editable table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                    margin: 1rem 0 !important;
                  }
                  .note-editable table td,
                  .note-editable table th {
                    border: 1px solid #d1d5db !important;
                    padding: 8px 12px !important;
                    text-align: left !important;
                  }
                  .note-editable table th {
                    background-color: #f9fafb !important;
                    font-weight: bold !important;
                  }
                  /* Image formatting */
                  .note-editable img {
                    max-width: 100% !important;
                    height: auto !important;
                    border-radius: 4px !important;
                    margin: 0.5rem 0 !important;
                  }
                  /* Text alignment */
                  .note-editable .text-left { text-align: left !important; }
                  .note-editable .text-center { text-align: center !important; }
                  .note-editable .text-right { text-align: right !important; }
                  .note-editable .text-justify { text-align: justify !important; }
                  /* Font sizes */
                  .note-editable .note-fontsize-8 { font-size: 8px !important; }
                  .note-editable .note-fontsize-9 { font-size: 9px !important; }
                  .note-editable .note-fontsize-10 { font-size: 10px !important; }
                  .note-editable .note-fontsize-11 { font-size: 11px !important; }
                  .note-editable .note-fontsize-12 { font-size: 12px !important; }
                  .note-editable .note-fontsize-14 { font-size: 14px !important; }
                  .note-editable .note-fontsize-16 { font-size: 16px !important; }
                  .note-editable .note-fontsize-18 { font-size: 18px !important; }
                  .note-editable .note-fontsize-24 { font-size: 24px !important; }
                  .note-editable .note-fontsize-36 { font-size: 36px !important; }
                  /* Font families */
                  .note-editable .note-fontname-sans-serif { font-family: sans-serif !important; }
                  .note-editable .note-fontname-serif { font-family: serif !important; }
                  .note-editable .note-fontname-monospace { font-family: monospace !important; }
                  .note-editable .note-fontname-cursive { font-family: cursive !important; }
                  .note-editable .note-fontname-fantasy { font-family: fantasy !important; }
                  /* Text colors */
                  .note-editable .note-color-black { color: #000000 !important; }
                  .note-editable .note-color-white { color: #ffffff !important; }
                  .note-editable .note-color-red { color: #dc2626 !important; }
                  .note-editable .note-color-orange { color: #ea580c !important; }
                  .note-editable .note-color-yellow { color: #ca8a04 !important; }
                  .note-editable .note-color-green { color: #16a34a !important; }
                  .note-editable .note-color-blue { color: #2563eb !important; }
                  .note-editable .note-color-indigo { color: #4f46e5 !important; }
                  .note-editable .note-color-violet { color: #7c3aed !important; }
                `;
                document.head.appendChild(cssOverride);
                
                // Force immediate application
                setTimeout(() => {
                  const editor = $(editorRef.current).find('.note-editable');
                  if (editor.length) {
                    editor.css({
                      'background-color': '#ffffff !important',
                      'color': '#000000 !important',
                      'min-height': '300px !important',
                      'padding': '12px !important'
                    });
                    console.log('Forced styles applied');
                  }
                }, 50);
                
                if (localValue) {
                  $(editorRef.current).summernote('code', localValue);
                }
              }
            }
          });

          return () => {
            if ($) {
              $(editorRef.current).summernote('destroy');
            }
          };
        } else {
          console.error('Summernote not found on jQuery object');
        }
      } else {
        console.error('jQuery not found');
      }
    }
  }, [isLoaded, placeholder]);

  useEffect(() => {
    if (isLoaded && editorRef.current && window.jQuery && window.jQuery.summernote) {
      const $ = window.jQuery;
      const currentCode = $(editorRef.current).summernote('code');
      if (currentCode !== value) {
        $(editorRef.current).summernote('code', value);
      }
    }
  }, [value, isLoaded]);

  return (
    <div className="summernote-editor">
      {!isLoaded && (
        <div className="flex items-center justify-center p-8 border border-neutral-700 rounded-md bg-neutral-900">
          <div className="text-center">
            <div className="text-sm text-neutral-400 mb-2">Se încarcă editorul...</div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      <div 
        ref={editorRef} 
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
      <style jsx>{`
        .note-editor {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
        }
        .note-editable {
          background-color: #ffffff !important;
          color: #000000 !important;
          min-height: 300px !important;
        }
        .note-toolbar {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
        }
        .note-btn {
          background-color: #f9fafb !important;
          border: 1px solid #d1d5db !important;
          color: #374151 !important;
        }
        .note-btn:hover {
          background-color: #f3f4f6 !important;
          border-color: #9ca3af !important;
        }
        .note-btn.active {
          background-color: #3b82f6 !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
        }
        .note-dropdown-menu {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .note-dropdown-menu a {
          color: #374151 !important;
          padding: 8px 12px !important;
          display: block !important;
        }
        .note-dropdown-menu a:hover {
          background-color: #f3f4f6 !important;
        }
        .note-modal {
          background-color: rgba(0, 0, 0, 0.5) !important;
        }
        .note-modal-content {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
        }
        .note-modal-header {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #d1d5db !important;
          padding: 16px !important;
        }
        .note-modal-title {
          color: #111827 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }
        .note-modal-body {
          background-color: #ffffff !important;
          padding: 16px !important;
        }
        .note-form-control {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          color: #111827 !important;
          padding: 8px 12px !important;
          border-radius: 4px !important;
          width: 100% !important;
        }
        .note-form-control:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
