"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Play, Globe, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addRecentUrl, getRecentUrls } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { TestType } from "@/types";

const TEST_OPTIONS: { label: string; value: TestType }[] = [
  { label: "Full Audit", value: "full-audit" },
  { label: "Performance", value: "performance" },
  { label: "SEO", value: "seo" },
  { label: "Accessibility", value: "accessibility" },
  { label: "Security", value: "security" },
  { label: "HTML/CSS/JS", value: "html-css-js" },
  { label: "Visual", value: "visual" },
  { label: "API", value: "api" },
];

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  testTypes: z.array(z.string()).min(1, "Select at least one test type"),
});

type FormData = z.infer<typeof formSchema>;

export function QuickTest() {
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "", testTypes: [] },
  });

  const selectedTypes = watch("testTypes");

  useEffect(() => {
    setRecentUrls(getRecentUrls().slice(0, 5));
  }, []);

  function toggleTestType(value: string) {
    const current = selectedTypes || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue("testTypes", next, { shouldValidate: true });
  }

  function selectRecentUrl(url: string) {
    setValue("url", url, { shouldValidate: true });
  }

  function clearRecentUrls() {
    setRecentUrls([]);
    try {
      localStorage.removeItem("recent-urls");
    } catch {}
  }

  function onSubmit(data: FormData) {
    addRecentUrl(data.url);
    setRecentUrls(getRecentUrls().slice(0, 5));
    console.log("Running tests:", data);
    reset();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Play className="h-5 w-5 text-primary" />
            Quick Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  placeholder="https://example.com"
                  className="pl-9"
                  {...register("url")}
                />
              </div>
              {errors.url && (
                <p className="text-sm text-destructive">
                  {errors.url.message}
                </p>
              )}
              {recentUrls.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">
                    Recent:
                  </span>
                  {recentUrls.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => selectRecentUrl(url)}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors truncate max-w-[180px]"
                    >
                      {url.replace(/^https?:\/\//, "")}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearRecentUrls}
                    className="text-xs px-1 py-0.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Clear recent URLs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Test Types</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEST_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors",
                      selectedTypes?.includes(opt.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedTypes?.includes(opt.value) ?? false}
                      onCheckedChange={() => toggleTestType(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.testTypes && (
                <p className="text-sm text-destructive">
                  {errors.testTypes.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Play className="h-4 w-4" />
              {isSubmitting ? "Starting..." : "Run Tests"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
