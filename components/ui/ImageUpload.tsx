// components/ui/ImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, Link, Check, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/imageResize';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
  allowUrl?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  placeholder = 'คลิกเพื่ออัพโหลดรูปภาพ',
  allowUrl = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ไฟล์ต้องมีขนาดไม่เกิน ${maxSize} MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    setError(null);
    setUploading(true);
    
    // Set file info
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size)
    });

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file if onUpload is provided
      if (onUpload) {
        const url = await onUpload(file);
        onChange(url);
      } else {
        // If no upload function, just use data URL
        onChange(reader.result as string);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการอัพโหลด');
      setPreview(value);
      setFileInfo(null);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('กรุณาใส่ URL รูปภาพ');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setError('URL ไม่ถูกต้อง');
      return;
    }

    // Check if URL is image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      urlInput.toLowerCase().includes(ext)
    );

    if (!hasImageExtension && !urlInput.includes('googleusercontent') && !urlInput.includes('firebasestorage')) {
      setError('URL ต้องเป็นรูปภาพ');
      return;
    }

    setError(null);
    setPreview(urlInput);
    onChange(urlInput);
    setShowUrlInput(false);
    setUrlInput('');
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(undefined);
    setError(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group"
          >
            <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Upload className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="p-3 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
              
              {/* Loading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white">กำลังประมวลผลรูป...</p>
                    {fileInfo && (
                      <p className="text-xs text-white/60 mt-1">
                        {fileInfo.size}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* File info */}
            {fileInfo && !uploading && (
              <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {fileInfo.name} ({fileInfo.size})
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* URL Input Mode */}
            {showUrlInput ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                  />
                  <motion.button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="px-4 py-3 metaverse-button text-white font-bold rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowUrlInput(false);
                      setUrlInput('');
                      setError(null);
                    }}
                    className="px-4 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                key="upload-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 glass border-2 border-dashed border-metaverse-purple/50 rounded-xl hover:border-metaverse-purple transition flex flex-col items-center justify-center gap-3 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-metaverse-purple animate-spin" />
                ) : (
                  <>
                    <div className="p-4 bg-metaverse-purple/20 rounded-full">
                      <ImageIcon className="w-8 h-8 text-metaverse-purple" />
                    </div>
                    <p className="text-white/60">{placeholder}</p>
                    <p className="text-sm text-white/40">PNG, JPG, GIF ไม่เกิน {maxSize}MB</p>
                  </>
                )}
              </motion.button>
            )}

            {/* Toggle URL Input Button */}
            {allowUrl && !showUrlInput && (
              <motion.button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="w-full py-2 glass rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link className="w-4 h-4" />
                หรือใส่ URL รูปภาพ
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}