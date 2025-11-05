"use client";

import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import type { ShatterOptions } from "@/lib/types";
import { Checkbox } from "./ui/checkbox";

interface ShatterOptionsProps {
  options: ShatterOptions;
  onChange: (options: ShatterOptions) => void;
}

export default function ShatterOptions({
  options,
  onChange,
}: ShatterOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex justify-between">
          <span>조각 개수</span>
          <span className="text-muted-foreground">{options.pieceCount}</span>
        </Label>
        <Slider
          value={[options.pieceCount]}
          onValueChange={([value]) =>
            onChange({ ...options, pieceCount: value })
          }
          min={30}
          max={200}
          step={10}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex justify-between">
          <span>떨어지는 속도</span>
          <span className="text-muted-foreground">
            {options.gravity.toFixed(1)}
          </span>
        </Label>
        <Slider
          value={[options.gravity]}
          onValueChange={([value]) => onChange({ ...options, gravity: value })}
          min={0.5}
          max={3.0}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex justify-between">
          <span>흩어지는 방향</span>
          <span className="text-muted-foreground">
            {options.spreadDirection}
          </span>
        </Label>
        <Slider
          value={[options.spreadDirection]}
          onValueChange={([value]) =>
            onChange({ ...options, spreadDirection: value })
          }
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>배경</Label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={options.transparent}
              onCheckedChange={(checked) =>
                onChange({ ...options, transparent: checked === true })
              }
            />
            <span className="text-sm">투명 배경</span>
          </label>
          {!options.transparent && (
            <div className="flex items-center gap-2">
              <Label htmlFor="bg-color" className="text-sm">
                배경색:
              </Label>
              <input
                id="bg-color"
                type="color"
                value={options.backgroundColor}
                onChange={(e) =>
                  onChange({ ...options, backgroundColor: e.target.value })
                }
                className="w-10 h-10 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
