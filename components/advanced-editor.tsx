"use client";

import { useState, useRef, useEffect } from "react";

interface AdvancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdvancedEditor({ value, onChange, placeholder = "Introdu descrierea produsului..." }: AdvancedEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isPreview]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current && !isPreview) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    for (let i = 0; i < tableRows; i++) {
      table += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        table += '<td style="border: 1px solid #ccc; padding: 8px;">Celulă</td>';
      }
      table += '</tr>';
    }
    table += '</table>';
    execCommand('insertHTML', table);
    setShowTableDialog(false);
  };

  const insertLink = () => {
    const link = `<a href="${linkUrl}" target="_blank">${linkText || linkUrl}</a>`;
    execCommand('insertHTML', link);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertImage = () => {
    const img = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`;
    execCommand('insertHTML', img);
    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
  };

  const insertVideo = () => {
    let embedCode = '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      }
    } else {
      embedCode = `<video controls style="max-width: 100%;"><source src="${videoUrl}" type="video/mp4">Browser-ul tău nu suportă video.</video>`;
    }
    if (embedCode) {
      execCommand('insertHTML', embedCode);
    }
    setShowVideoDialog(false);
    setVideoUrl('');
  };

  const insertCode = () => {
    const code = prompt('Introdu codul:');
    if (code) {
      execCommand('insertHTML', `<pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto;"><code>${code}</code></pre>`);
    }
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const getPreviewContent = () => {
    if (editorRef.current) {
      return editorRef.current.innerHTML;
    }
    return '';
  };

  const EditorContent = () => (
    <div
      ref={editorRef}
      contentEditable
      className="min-h-[300px] w-full rounded-md border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-100 outline-none focus:border-blue-500"
      style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : '300px' }}
      onInput={updateContent}
      onMouseUp={updateContent}
      onKeyUp={updateContent}
      suppressContentEditableWarning
    />
  );

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-neutral-950 p-4' : ''}`}>
      <div className={`w-full ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
        {/* Toolbar */}
        <div className="mb-2 flex flex-wrap gap-1 rounded-md border border-neutral-700 bg-neutral-900 p-2">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Underline"
            >
              <u>U</u>
            </button>
            <button
              type="button"
              onClick={() => execCommand('strikeThrough')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Strike Through"
            >
              <s>S</s>
            </button>
            <button
              type="button"
              onClick={() => execCommand('removeFormat')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Remove Format"
            >
              🧹
            </button>
          </div>

          {/* Font Family & Size */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <select
              onChange={(e) => execCommand('fontName', e.target.value)}
              className="h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-xs text-neutral-200"
              title="Font Family"
            >
              <option value="">Font</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Comic Sans MS">Comic Sans</option>
            </select>
            <select
              onChange={(e) => execCommand('fontSize', e.target.value)}
              defaultValue="3"
              className="h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-xs text-neutral-200"
              title="Font Size"
            >
              <option value="1">8pt</option>
              <option value="2">10pt</option>
              <option value="3">12pt</option>
              <option value="4">14pt</option>
              <option value="5">18pt</option>
              <option value="6">24pt</option>
              <option value="7">36pt</option>
            </select>
          </div>

          {/* Colors */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
                title="Text Color"
              >
                🎨
              </button>
              {showColorPicker && (
                <div className="absolute top-10 left-0 z-10 rounded-md border border-neutral-700 bg-neutral-900 p-2 shadow-lg">
                  <div className="grid grid-cols-6 gap-1">
                    {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          execCommand('foreColor', color);
                          setShowColorPicker(false);
                        }}
                        className="h-6 w-6 rounded border border-neutral-600"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => execCommand('hiliteColor', '#FFFF00')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Highlight Color"
            >
              🖍️
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Unordered List"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Ordered List"
            >
              1.
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Align Left"
            >
              ⬅️
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Align Center"
            >
              ⬆️
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Align Right"
            >
              ➡️
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyFull')}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Justify"
            >
              ↔️
            </button>
          </div>

          {/* Insert Elements */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <button
              type="button"
              onClick={() => setShowLinkDialog(true)}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Insert Link"
            >
              🔗
            </button>
            <button
              type="button"
              onClick={() => setShowImageDialog(true)}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Insert Image"
            >
              🖼️
            </button>
            <button
              type="button"
              onClick={() => setShowVideoDialog(true)}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Insert Video"
            >
              🎥
            </button>
            <button
              type="button"
              onClick={() => setShowTableDialog(true)}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Insert Table"
            >
              📊
            </button>
            <button
              type="button"
              onClick={insertCode}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Insert Code"
            >
              💻
            </button>
          </div>

          {/* Paragraph & Headings */}
          <div className="flex gap-1 border-r border-neutral-700 pr-2">
            <select
              onChange={(e) => formatBlock(e.target.value)}
              className="h-8 rounded border border-neutral-600 bg-neutral-800 px-2 text-xs text-neutral-200"
              title="Paragraph Format"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>

          {/* View Controls */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white ${isPreview ? 'bg-blue-600' : ''}`}
              title="Preview"
            >
              👁️
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 rounded border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-blue-500 hover:text-white"
              title="Fullscreen"
            >
              {isFullscreen ? '🔲' : '🔳'}
            </button>
          </div>
        </div>

        {/* Editor or Preview */}
        <div className="flex-1">
          {isPreview ? (
            <div className="min-h-[300px] rounded-md border border-neutral-700 bg-white p-4 text-sm text-black">
              <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
            </div>
          ) : (
            <EditorContent />
          )}
        </div>

        {/* Close button for fullscreen */}
        {isFullscreen && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="rounded-md bg-red-600 px-4 py-2 text-xs text-white hover:bg-red-500"
            >
              Închide Fullscreen
            </button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-md border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Adaugă Link</h3>
            <input
              type="url"
              placeholder="URL (ex: https://example.com)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mb-3 h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
            />
            <input
              type="text"
              placeholder="Text link (opțional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="mb-4 h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="h-8 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-200 hover:border-neutral-600"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl}
                className="h-8 rounded-md bg-blue-600 px-3 text-xs text-white hover:bg-blue-500 disabled:opacity-60"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-md border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Adaugă Imagine</h3>
            <input
              type="url"
              placeholder="URL imagine (ex: https://example.com/image.jpg)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mb-3 h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
            />
            <input
              type="text"
              placeholder="Text alternativ (opțional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="mb-4 h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="h-8 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-200 hover:border-neutral-600"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={insertImage}
                disabled={!imageUrl}
                className="h-8 rounded-md bg-blue-600 px-3 text-xs text-white hover:bg-blue-500 disabled:opacity-60"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-md border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Adaugă Video</h3>
            <input
              type="url"
              placeholder="URL video (YouTube sau MP4)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mb-4 h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowVideoDialog(false)}
                className="h-8 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-200 hover:border-neutral-600"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={insertVideo}
                disabled={!videoUrl}
                className="h-8 rounded-md bg-blue-600 px-3 text-xs text-white hover:bg-blue-500 disabled:opacity-60"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {showTableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-md border border-neutral-700 bg-neutral-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Adaugă Tabel</h3>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-neutral-300">Rânduri</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value))}
                  className="h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-300">Coloane</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value))}
                  className="h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="h-8 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-xs text-neutral-200 hover:border-neutral-600"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="h-8 rounded-md bg-blue-600 px-3 text-xs text-white hover:bg-blue-500"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
