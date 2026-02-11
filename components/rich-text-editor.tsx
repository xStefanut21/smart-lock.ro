"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          alert("Doar fișierele imagine sunt permise.");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("Dimensiunea maximă a fișierului este 5MB.");
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `description-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("description-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Nu am putut încărca imaginea.");
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("description-images").getPublicUrl(filePath);

        // Insert image markdown at cursor position
        const imageMarkdown = `\n![${file.name}](${publicUrl})\n`;
        const newValue = value + imageMarkdown;
        onChange(newValue);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("A apărut o eroare la încărcarea imaginilor.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(new DataTransfer().files);
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-neutral-400 border-t-transparent"></div>
              Se încarcă...
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Adaugă imagine
            </>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-[10px] text-neutral-500">
          Sau lipește imagini direct (Ctrl+V)
        </div>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder || "Adaugă descrierea produsului... Poți folosi markdown pentru formatare și poți adăuga imagini."}
        className="w-full min-h-[200px] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-red-500 focus:outline-none"
        rows={8}
      />
      
      <div className="text-[10px] text-neutral-500">
        <p>Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Pentru imagini: ![nume](url) sau folosește butonul de mai sus</li>
          <li>Pentru bold: **text**</li>
          <li>Pentru italic: *text*</li>
          <li>Pentru liste: - item</li>
        </ul>
      </div>
    </div>
  );
}
