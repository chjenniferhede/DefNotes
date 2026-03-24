import { useState, useRef, useCallback } from "react";
import { uploadDocument } from "../data/api";

interface UploadPdfDialogProps {
  notebookId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadPdfDialog({
  notebookId,
  onClose,
  onSuccess,
}: UploadPdfDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const handleConfirm = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(notebookId, file);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-gray-200 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Upload PDF</h2>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragging
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) acceptFile(f);
            }}
          />
          {file ? (
            <p className="text-sm text-gray-700 text-center break-all">
              {file.name}
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Drag & drop a PDF here
              </p>
              <p className="text-xs text-gray-400">or click to browse</p>
            </>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            className="text-sm px-4 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-none"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="text-sm px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-none"
            onClick={handleConfirm}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
