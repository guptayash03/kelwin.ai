import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export function uploadResume(
  file: File,
  userId: string,
  onProgress: (progress: UploadProgress) => void
): Promise<{ storagePath: string; downloadURL: string }> {
  if (file.type !== "application/pdf") {
    return Promise.reject(new Error("Only PDF files are accepted"));
  }
  if (file.size > 10 * 1024 * 1024) {
    return Promise.reject(new Error("File must be under 10MB"));
  }

  const storagePath = `users/${userId}/resume/${file.name}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: "application/pdf",
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        onProgress({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage: Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          ),
        });
      },
      (error) => {
        console.error("Upload error:", error.code, error.message);
        if (error.code === "storage/unauthorized") {
          reject(new Error("Storage permission denied. Check Firebase Storage rules."));
        } else if (error.code === "storage/canceled") {
          reject(new Error("Upload was canceled."));
        } else {
          reject(new Error(`Upload failed: ${error.message}`));
        }
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ storagePath, downloadURL });
      }
    );
  });
}
