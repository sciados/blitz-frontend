"use client";

import { EditTool } from "src/app/image-editor/page";

interface ImageEditorSidebarProps {
  selectedEditTool: EditTool;
  onEditToolChange: (tool: EditTool) => void;
  prompt: string;
  negativePrompt: string;
  searchPrompt: string;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onSearchPromptChange: (value: string) => void;
  outpaintLeft: number;
  outpaintRight: number;
  outpaintUp: number;
  outpaintDown: number;
  creativity: number;
  onOutpaintLeftChange: (value: number) => void;
  onOutpaintRightChange: (value: number) => void;
  onOutpaintUpChange: (value: number) => void;
  onOutpaintDownChange: (value: number) => void;
  onCreativityChange: (value: number) => void;
  isProcessing: boolean;
}

export function ImageEditorSidebar({
  selectedEditTool,
  onEditToolChange,
  prompt,
  negativePrompt,
  searchPrompt,
  onPromptChange,
  onNegativePromptChange,
  onSearchPromptChange,
  outpaintLeft,
  outpaintRight,
  outpaintUp,
  outpaintDown,
  creativity,
  onOutpaintLeftChange,
  onOutpaintRightChange,
  onOutpaintUpChange,
  onOutpaintDownChange,
  onCreativityChange,
  isProcessing,
}: ImageEditorSidebarProps) {
  const tools: {
    id: EditTool;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "inpaint",
      label: "Inpaint",
      icon: "🎨",
      description: "Fill masked areas with AI",
    },
    {
      id: "erase",
      label: "Erase",
      icon: "🧹",
      description: "Remove objects cleanly",
    },
    {
      id: "background-remove",
      label: "Remove BG",
      icon: "🖼️",
      description: "Remove background",
    },
    {
      id: "search-replace",
      label: "Replace",
      icon: "🔄",
      description: "Replace specific objects",
    },
    {
      id: "outpaint",
      label: "Extend",
      icon: "↔️",
      description: "Extend image borders",
    },
    {
      id: "upscale",
      label: "Upscale",
      icon: "⬆️",
      description: "AI enhance & upscale",
    },
    {
      id: "sketch-to-image",
      label: "Sketch",
      icon: "✏️",
      description: "Sketch to photo",
    },
    {
      id: "overlay",
      label: "Overlay",
      icon: "📝",
      description: "Add text/images",
    },
    {
      id: "resize",
      label: "Resize",
      icon: "📐",
      description: "Smart resize & format",
    },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-auto">
      <h3 className="text-lg font-semibold mb-4">Edit Tools</h3>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onEditToolChange(tool.id)}
            disabled={isProcessing}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedEditTool === tool.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } disabled:opacity-50`}
          >
            <div className="text-2xl mb-1">{tool.icon}</div>
            <div className="text-sm font-semibold">{tool.label}</div>
            <div className="text-xs text-gray-600">{tool.description}</div>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Settings</h4>

        {/* Inpainting Settings */}
        {selectedEditTool === "inpaint" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to paint in masked area..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Erase Settings */}
        {selectedEditTool === "erase" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Paint over objects you want to remove. AI will intelligently fill
              the area.
            </p>
          </div>
        )}

        {/* Background Removal Settings */}
        {selectedEditTool === "background-remove" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Automatically removes the background from your image. No mask
              needed!
            </p>
          </div>
        )}

        {/* Search & Replace Settings */}
        {selectedEditTool === "search-replace" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search For *
              </label>
              <input
                type="text"
                value={searchPrompt}
                onChange={(e) => onSearchPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g., 'the car'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Replace With *
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g., 'a bicycle'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Outpainting Settings */}
        {selectedEditTool === "outpaint" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="Describe how to extend..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Left (px)
                </label>
                <input
                  type="number"
                  value={outpaintLeft}
                  onChange={(e) => onOutpaintLeftChange(Number(e.target.value))}
                  disabled={isProcessing}
                  min="0"
                  max="2000"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Right (px)
                </label>
                <input
                  type="number"
                  value={outpaintRight}
                  onChange={(e) =>
                    onOutpaintRightChange(Number(e.target.value))
                  }
                  disabled={isProcessing}
                  min="0"
                  max="2000"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Up (px)
                </label>
                <input
                  type="number"
                  value={outpaintUp}
                  onChange={(e) => onOutpaintUpChange(Number(e.target.value))}
                  disabled={isProcessing}
                  min="0"
                  max="2000"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Down (px)
                </label>
                <input
                  type="number"
                  value={outpaintDown}
                  onChange={(e) => onOutpaintDownChange(Number(e.target.value))}
                  disabled={isProcessing}
                  min="0"
                  max="2000"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creativity: {creativity.toFixed(2)}
              </label>
              <input
                type="range"
                value={creativity}
                onChange={(e) => onCreativityChange(Number(e.target.value))}
                disabled={isProcessing}
                min="0"
                max="1"
                step="0.05"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        )}

        {/* Upscale Settings */}
        {selectedEditTool === "upscale" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="Describe the image for better upscaling..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500">
              Upscales to higher resolution while enhancing quality
            </p>
          </div>
        )}

        {/* Sketch to Image Settings */}
        {selectedEditTool === "sketch-to-image" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="Describe what the sketch represents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
