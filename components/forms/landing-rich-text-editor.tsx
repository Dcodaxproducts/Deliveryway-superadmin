"use client";

import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";

type EditorCommand =
  | { type: "command"; command: string; value?: string }
  | { type: "block"; value: "p" | "h1" | "h2" | "h3" };

type ToolbarButton = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  action: EditorCommand;
};

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    {
      label: "Paragraph",
      icon: Pilcrow,
      action: { type: "block", value: "p" },
    },
    {
      label: "Heading 1",
      icon: Heading1,
      action: { type: "block", value: "h1" },
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: { type: "block", value: "h2" },
    },
    {
      label: "Heading 3",
      icon: Heading3,
      action: { type: "block", value: "h3" },
    },
  ],
  [
    { label: "Bold", icon: Bold, action: { type: "command", command: "bold" } },
    {
      label: "Italic",
      icon: Italic,
      action: { type: "command", command: "italic" },
    },
    {
      label: "Underline",
      icon: Underline,
      action: { type: "command", command: "underline" },
    },
  ],
  [
    {
      label: "Bulleted list",
      icon: List,
      action: { type: "command", command: "insertUnorderedList" },
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      action: { type: "command", command: "insertOrderedList" },
    },
  ],
  [
    {
      label: "Undo",
      icon: Undo2,
      action: { type: "command", command: "undo" },
    },
    {
      label: "Redo",
      icon: Redo2,
      action: { type: "command", command: "redo" },
    },
    {
      label: "Clear formatting",
      icon: RemoveFormatting,
      action: { type: "command", command: "removeFormat" },
    },
  ],
];

export function LandingRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const latestExternalValue = useRef("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (!editorRef.current || latestExternalValue.current === value) return;

    editorRef.current.innerHTML = value;
    latestExternalValue.current = value;
  }, [value]);

  const syncValue = () => {
    const nextValue = editorRef.current?.innerHTML ?? "";
    latestExternalValue.current = nextValue;
    onChange(nextValue);
  };

  const runCommand = (action: EditorCommand) => {
    if (disabled) return;

    editorRef.current?.focus();
    if (action.type === "block") {
      document.execCommand("formatBlock", false, action.value);
    } else {
      document.execCommand(action.command, false, action.value);
    }
    syncValue();
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url || disabled) return;

    runCommand({ type: "command", command: "createLink", value: url });
    setLinkUrl("");
  };

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#D0D5DD] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EAECF0] bg-[#F8FAFC] p-3">
        {TOOLBAR_GROUPS.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex items-center gap-1 rounded-[10px] border border-[#EAECF0] bg-white p-1"
          >
            {group.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  disabled={disabled}
                  onClick={() => runCommand(item.action)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[#475467] transition hover:bg-[#F2F4F7] hover:text-[#101828] disabled:opacity-50"
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        ))}

        <div className="flex h-11 min-w-0 items-center gap-2 rounded-[10px] border border-[#EAECF0] bg-white px-3">
          <Link className="size-4 shrink-0 text-[#98A2B3]" />
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                insertLink();
              }
            }}
            placeholder="https://"
            disabled={disabled}
            aria-label="Link URL"
            className="h-9 w-36 bg-transparent text-sm text-[#475467] outline-none"
          />
          <button
            type="button"
            disabled={disabled || !linkUrl.trim()}
            onClick={insertLink}
            className="rounded-lg bg-[#101828] px-3 py-1.5 text-xs font-semibold text-white disabled:bg-[#D0D5DD]"
          >
            Add
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder}
        onInput={syncValue}
        onBlur={syncValue}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[360px] w-full overflow-auto px-6 py-5 text-sm leading-7 text-[#344054] outline-none empty:before:pointer-events-none empty:before:text-[#98A2B3] empty:before:content-[attr(data-placeholder)] [&_a]:font-semibold [&_a]:text-primary [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
          disabled && "cursor-not-allowed bg-[#F9FAFB] opacity-80",
        )}
      />
    </div>
  );
}
