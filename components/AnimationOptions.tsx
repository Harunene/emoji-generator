"use client";

import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { OutputSize } from "@/lib/types";

interface AnimationOptionsProps {
  outputSize: OutputSize;
  onOutputSizeChange: (size: OutputSize) => void;
}

export default function AnimationOptions({
  outputSize,
  onOutputSizeChange,
}: AnimationOptionsProps) {
  const sizes: OutputSize[] = [256, 128, 64];

  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>출력 크기</Label>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onOutputSizeChange(size)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  outputSize === size
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
