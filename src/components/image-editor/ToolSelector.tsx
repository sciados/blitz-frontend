"use client";

import { EditTool } from "src/app/image-editor/page";

interface ToolSelectorProps {
  selectedTool: EditTool;
}

export function ToolSelector({ selectedTool }: ToolSelectorProps) {
  const toolInfo: Record<
    EditTool,
    { name: string; description: string; useCases: string[] }
  > = {
    inpaint: {
      name: "Inpainting",
      description: "Fill masked areas with AI-generated content",
      useCases: [
        "Add new objects to images",
        "Modify specific areas",
        "Fix imperfections",
        "Change colors or textures",
      ],
    },
    erase: {
      name: "Erase Objects",
      description: "Remove unwanted objects cleanly",
      useCases: [
        "Remove people or objects",
        "Clean up cluttered backgrounds",
        "Remove watermarks",
        "Delete unwanted elements",
      ],
    },
    "background-remove": {
      name: "Background Removal",
      description: "Automatically remove backgrounds",
      useCases: [
        "Product photography",
        "Create transparent PNGs",
        "Isolate subjects",
        "Prepare for compositing",
      ],
    },
    "search-replace": {
      name: "Search & Replace",
      description: "Find and replace specific objects",
      useCases: [
        "Swap objects in scenes",
        "Update product photos",
        "Change vehicles or items",
        "Rebrand images",
      ],
    },
    outpaint: {
      name: "Outpainting",
      description: "Extend image borders with AI",
      useCases: [
        "Expand canvas size",
        "Add more background",
        "Create wider panoramas",
        "Extend cropped images",
      ],
    },
    upscale: {
      name: "Creative Upscale",
      description: "AI-enhanced resolution increase",
      useCases: [
        "Enhance low-res images",
        "Prepare for print",
        "Improve social media quality",
        "Restore old photos",
      ],
    },
    "sketch-to-image": {
      name: "Sketch to Image",
      description: "Convert drawings to realistic photos",
      useCases: [
        "Visualize concept sketches",
        "Create mockups from drawings",
        "Design exploration",
        "Rapid prototyping",
      ],
    },
    overlay: {
      name: "Text & Image Overlay",
      description: "Add text and image overlays (no AI cost!)",
      useCases: [
        "Add watermarks or logos",
        "Create memes and social posts",
        "Add branding to images",
        "Design marketing materials",
      ],
    },
    resize: {
      name: "Smart Resize",
      description: "Resize for any platform (no AI cost!)",
      useCases: [
        "Instagram, Facebook, Twitter sizes",
        "Pinterest tall pins",
        "YouTube thumbnails",
        "E-commerce product images",
      ],
    },
    filters: {
      name: "Filters & Color",
      description: "Apply preset filters and adjust colors",
      useCases: [
        "Apply vintage or cinematic looks",
        "Adjust brightness and contrast",
        "Change color temperature",
        "Fine-tune shadows and highlights",
      ],
    },
    collage: {
      name: "Collage Maker",
      description: "Combine multiple images into layouts",
      useCases: [
        "Create Instagram grid posts",
        "Before/after comparisons",
        "Product showcases",
        "Multi-image stories",
      ],
    },
  };

  const info = toolInfo[selectedTool];

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded">
      <h4 className="font-semibold text-sm text-blue-900 mb-2">{info.name}</h4>
      <p className="text-xs text-blue-800 mb-3">{info.description}</p>

      <div className="text-xs text-blue-800">
        <p className="font-semibold mb-1">Use Cases:</p>
        <ul className="space-y-1">
          {info.useCases.map((useCase, index) => (
            <li key={index}>• {useCase}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
