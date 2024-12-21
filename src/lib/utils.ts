import { type ClassValue, clsx } from "clsx"
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDialogueChunk(
  text: string
): Array<{ id: string; content: string; host: string }> {
  const dialogueEntries: Array<{ id: string; content: string; host: string }> =
    [];
  const regex = /<host([12])>(.*?)<\/host>/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [, hostNum, content] = match;
    dialogueEntries.push({
      id: nanoid(10),
      content: content.trim(),
      host: hostNum === "1" ? "host1" : "host2",
    });
  }

  return dialogueEntries;
}
