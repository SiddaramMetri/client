;

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useThemeConfig } from "@/components/active-theme";
import { Button } from "@/components/ui/button";

export function ModeSwitcher() {
  const {  setActiveTheme } = useThemeConfig();

  const toggleTheme = React.useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark");
    setActiveTheme(isDark ? "default" : "default-scaled");
  }, [setActiveTheme]);

  return (
    <Button
      variant="ghost"
      className="group/toggle h-8 w-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
