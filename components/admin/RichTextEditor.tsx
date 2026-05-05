"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FiBold, FiImage, FiItalic, FiLink, FiList, FiMinus, FiType } from "react-icons/fi";

interface RichTextEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

function getImageFiles(fileList: FileList | null) {
  return Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
}

function getClipboardImageFiles(dataTransfer: DataTransfer | null) {
  const directFiles = getImageFiles(dataTransfer?.files ?? null);
  if (directFiles.length) return directFiles;

  return Array.from(dataTransfer?.items ?? [])
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export function RichTextEditor({ id, label, value, onChange, placeholder, onUploadImage }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Escribe contenido SEO con títulos, enlaces e imágenes." })
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "admin-rich-editor__content",
        id
      },
      handlePaste(view, event) {
        if (!onUploadImage) return false;

        const files = getClipboardImageFiles(event.clipboardData);
        if (!files.length) return false;

        event.preventDefault();
        void uploadImages(files, (url) => {
          const image = view.state.schema.nodes.image.create({ src: url });
          view.dispatch(view.state.tr.replaceSelectionWith(image).scrollIntoView());
        });
        return true;
      }
    },
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML(), activeEditor.getText());
    }
  });

  function setLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("URL del enlace", previousUrl ?? "https://");

    if (nextUrl === null) return;

    if (!nextUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl.trim() }).run();
  }

  function addImage() {
    if (!editor) return;

    if (onUploadImage) {
      fileInputRef.current?.click();
      return;
    }

    const url = window.prompt("URL de la imagen", "https://");

    if (!url?.trim()) return;

    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  async function uploadImages(files: File[], insertImage: (url: string) => void) {
    if (!onUploadImage || !files.length) return;

    setUploadError("");
    setIsUploading(true);
    try {
      for (const file of files) {
        const url = await onUploadImage(file);
        insertImage(url);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen pegada.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = getImageFiles(event.target.files);
    event.target.value = "";
    if (!files.length || !editor || !onUploadImage) return;

    await uploadImages(files, (url) => editor.chain().focus().setImage({ src: url }).run());
  }

  return (
    <div className="admin-rich-editor">
      <label className="admin-label" htmlFor={id}>{label}</label>
      {onUploadImage ? (
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
      ) : null}
      <div className="admin-rich-editor__toolbar" aria-label="Herramientas del editor">
        <button type="button" className={editor?.isActive("bold") ? "is-active" : ""} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Negrita">
          <FiBold aria-hidden="true" />
        </button>
        <button type="button" className={editor?.isActive("italic") ? "is-active" : ""} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Cursiva">
          <FiItalic aria-hidden="true" />
        </button>
        <button type="button" className={editor?.isActive("heading", { level: 2 }) ? "is-active" : ""} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Título H2">
          <FiType aria-hidden="true" /> H2
        </button>
        <button type="button" className={editor?.isActive("bulletList") ? "is-active" : ""} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Lista">
          <FiList aria-hidden="true" />
        </button>
        <button type="button" className={editor?.isActive("link") ? "is-active" : ""} onClick={setLink} aria-label="Enlace">
          <FiLink aria-hidden="true" />
        </button>
        <button type="button" onClick={addImage} disabled={isUploading} aria-label={isUploading ? "Subiendo imagen..." : "Imagen"}>
          <FiImage aria-hidden="true" />{isUploading ? " …" : ""}
        </button>
        <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()} aria-label="Separador">
          <FiMinus aria-hidden="true" />
        </button>
      </div>
      {uploadError ? <p className="admin-upload-status">{uploadError}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}