"use client";

import { useTheme } from "next-themes";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";

interface ThemeButtonProps {
  theme: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function ThemeButton({ theme, icon, isActive, onClick }: ThemeButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 rounded-full',
        isActive ? 'bg-muted' : 'hover:bg-muted/50'
      )}
    >
      {icon}
    </button>
  );
}

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center justify-between">
      <span className="mr-2">主题</span>
      <div className="flex border rounded-full p-1 gap-2" role="group">
        <ThemeButton
          theme="light"
          icon={<Icons.sun className="h-4 w-4" />}
          isActive={theme === 'light'}
          onClick={() => setTheme('light')}
        />
        <ThemeButton
          theme="dark"
          icon={<Icons.moon className="h-4 w-4" />}
          isActive={theme === 'dark'}
          onClick={() => setTheme('dark')}
        />
        <ThemeButton
          theme="system"
          icon={<Icons.laptop className="h-4 w-4" />}
          isActive={theme === 'system'}
          onClick={() => setTheme('system')}
        />
      </div>
    </div>
  );
}
