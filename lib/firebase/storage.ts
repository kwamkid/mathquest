// lib/firebase/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './client';
import { resizeImage, shouldResizeImage } from '@/lib/utils/imageResize';

interface UploadOptions {
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Upload image to Firebase Storage with optional resizing
export const uploadImage = async (
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<{ url: string; path: string }> => {
  try {
    const {
      resize = true,
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.85
    } = options;

    let fileToUpload = file;
    
    // Check if resize is needed
    if (resize) {
      const needsResize = await shouldResizeImage(file, 2 * 1024 * 1024, Math.max(maxWidth, maxHeight));
      
      if (needsResize) {
        console.log(`Resizing image from ${file.size} bytes...`);
        const { file: resizedFile } = await resizeImage(file, {
          maxWidth,
          maxHeight,
          quality,
          format: 'jpeg'
        });
        fileToUpload = resizedFile;
        console.log(`Resized to ${fileToUpload.size} bytes`);
      }
    }
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    const url = await getDownloadURL(snapshot.ref);
    
    return { url, path };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Delete error:', error);
    // ไม่ throw error เพราะบางทีไฟล์อาจจะไม่มีอยู่แล้ว
  }
};

// Get image URL from path
export const getImageUrl = async (path: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Get URL error:', error);
    return null;
  }
};