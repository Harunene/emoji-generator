"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import ShatterOptions from "./ShatterOptions";
import type { EffectOptions } from "@/lib/types";

interface EffectOptionsProps {
  options: EffectOptions;
  onChange: (options: EffectOptions) => void;
}

export default function EffectOptions({
  options,
  onChange,
}: EffectOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>효과 설정</CardTitle>
        <CardDescription>지금은 shatter 효과만 있음</CardDescription>
      </CardHeader>
      <CardContent>
        {options.type === "shatter" && (
          <ShatterOptions
            options={options.shatter}
            onChange={(shatterOptions) =>
              onChange({ ...options, shatter: shatterOptions })
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
