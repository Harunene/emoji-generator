"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { Card } from "./ui/card";

interface ImageUploaderProps {
  onImageLoad: (image: HTMLImageElement, file: File) => void;
}

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onImageLoad(img, file);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center p-12 cursor-pointer text-center">
        <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          이미지를 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-sm text-muted-foreground">
          PNG, JPG, GIF (최대 5MB)
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </Card>
  );
}
