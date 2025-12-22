"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ImageEditorCanvas } from '@/components/image-editor/ImageEditorCanvas';
import { ImageEditorToolbar } from '@/components/image-editor/ImageEditorToolbar';
import { ImageEditorSidebar } from '@/components/image-editor/ImageEditorSidebar';
import { ToolSelector } from '@/components/image-editor/ToolSelector';
import { OverlayEditor } from '@/components/image-editor/OverlayEditor';
import { SmartResize } from '@/components/image-editor/SmartResize';

export type EditTool = 'inpaint' | 'erase' | 'background-remove' | 'search-replace' | 'outpaint' | 'upscale' | 'sketch-to-image' | 'overlay' | 'resize';

export default function ImageEditorPage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');
  const campaignId = searchParams.get('campaignId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tool states
  const [selectedEditTool, setSelectedEditTool] = useState<EditTool>('inpaint');
  const [selectedDrawTool, setSelectedDrawTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(20);
  
  // Common parameters
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState(0);
  
  // Search & Replace specific
  const [searchPrompt, setSearchPrompt] = useState('');
  
  // Outpainting specific
  const [outpaintLeft, setOutpaintLeft] = useState(200);
  const [outpaintRight, setOutpaintRight] = useState(200);
  const [outpaintUp, setOutpaintUp] = useState(0);
  const [outpaintDown, setOutpaintDown] = useState(0);
  const [creativity, setCreativity] = useState(0.5);

  useEffect(() => {
    if (!imageUrl || !campaignId) {
      setError('Missing required parameters: imageUrl and campaignId');
      setLoading(false);
      return;
    }

    setOriginalImage(imageUrl);
    setLoading(false);
  }, [imageUrl, campaignId]);

  const handleEdit = async (maskDataUrl?: string) => {
    if (!campaignId || !imageUrl) {
      alert('Missing campaign ID or image URL');
      return;
    }

    // Validation based on tool
    if (['inpaint', 'search-replace', 'upscale'].includes(selectedEditTool) && !prompt) {
      alert('Please enter a prompt');
      return;
    }

    if (selectedEditTool === 'search-replace' && !searchPrompt) {
      alert('Please enter a search prompt');
      return;
    }

    if (['inpaint', 'erase'].includes(selectedEditTool) && !maskDataUrl) {
      alert('Please paint a mask first');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image_url', imageUrl);
      formData.append('campaign_id', campaignId);
      formData.append('output_format', 'png');

      let endpoint = '';

      switch (selectedEditTool) {
        case 'inpaint':
          endpoint = '/api/image-editor/inpaint';
          formData.append('prompt', prompt);
          if (negativePrompt) formData.append('negative_prompt', negativePrompt);
          if (maskDataUrl) formData.append('mask_image_data', maskDataUrl);
          formData.append('seed', seed.toString());
          break;

        case 'erase':
          endpoint = '/api/image-editor/erase';
          if (maskDataUrl) formData.append('mask_image_data', maskDataUrl);
          formData.append('seed', seed.toString());
          break;

        case 'background-remove':
          endpoint = '/api/image-editor/remove-background';
          break;

        case 'search-replace':
          endpoint = '/api/image-editor/search-replace';
          formData.append('search_prompt', searchPrompt);
          formData.append('prompt', prompt);
          if (negativePrompt) formData.append('negative_prompt', negativePrompt);
          formData.append('seed', seed.toString());
          break;

        case 'outpaint':
          endpoint = '/api/image-editor/outpaint';
          formData.append('prompt', prompt);
          formData.append('left', outpaintLeft.toString());
          formData.append('right', outpaintRight.toString());
          formData.append('up', outpaintUp.toString());
          formData.append('down', outpaintDown.toString());
          formData.append('creativity', creativity.toString());
          formData.append('seed', seed.toString());
          break;

        case 'upscale':
          endpoint = '/api/image-editor/upscale';
          formData.append('prompt', prompt);
          if (negativePrompt) formData.append('negative_prompt', negativePrompt);
          formData.append('creativity', '0.35');
          formData.append('seed', seed.toString());
          break;

        case 'sketch-to-image':
          endpoint = '/api/image-editor/sketch-to-image';
          formData.append('prompt', prompt);
          if (negativePrompt) formData.append('negative_prompt', negativePrompt);
          formData.append('control_strength', '0.7');
          formData.append('seed', seed.toString());
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Edit operation failed');
      }

      const result = await response.json();
      
      if (result.success && result.edited_image_url) {
        setEditedImage(result.edited_image_url);
      } else {
        throw new Error('Failed to generate edited image');
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverlaySave = (overlayImageDataUrl: string) => {
    setEditedImage(overlayImageDataUrl);
  };

  const handleResizeSave = (resizedImageDataUrl: string, preset: string) => {
    setEditedImage(resizedImageDataUrl);
  };

  const handleReset = () => {
    setEditedImage(null);
    setPrompt('');
    setNegativePrompt('');
    setSearchPrompt('');
  };

  const handleDownload = () => {
    const imageToDownload = editedImage || originalImage;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `edited-${selectedEditTool}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading image editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isFullWidthTool = selectedEditTool === 'overlay' || selectedEditTool === 'resize';

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Toolbar */}
      <ImageEditorToolbar
        selectedTool={selectedDrawTool}
        onToolChange={setSelectedDrawTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onReset={handleReset}
        onDownload={handleDownload}
        isProcessing={isProcessing}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tool Selector & Settings (hide for full-width tools) */}
        {!isFullWidthTool && (
          <ImageEditorSidebar
            selectedEditTool={selectedEditTool}
            onEditToolChange={setSelectedEditTool}
            prompt={prompt}
            negativePrompt={negativePrompt}
            searchPrompt={searchPrompt}
            onPromptChange={setPrompt}
            onNegativePromptChange={setNegativePrompt}
            onSearchPromptChange={setSearchPrompt}
            outpaintLeft={outpaintLeft}
            outpaintRight={outpaintRight}
            outpaintUp={outpaintUp}
            outpaintDown={outpaintDown}
            creativity={creativity}
            onOutpaintLeftChange={setOutpaintLeft}
            onOutpaintRightChange={setOutpaintRight}
            onOutpaintUpChange={setOutpaintUp}
            onOutpaintDownChange={setOutpaintDown}
            onCreativityChange={setCreativity}
            isProcessing={isProcessing}
          />
        )}

        {/* Main Canvas/Editor Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {selectedEditTool === 'overlay' ? (
            <OverlayEditor
              originalImage={originalImage}
              onSave={handleOverlaySave}
              isProcessing={isProcessing}
            />
          ) : selectedEditTool === 'resize' ? (
            <SmartResize
              originalImage={originalImage}
              onSave={handleResizeSave}
              isProcessing={isProcessing}
            />
          ) : (
            <ImageEditorCanvas
              originalImage={originalImage}
              editedImage={editedImage}
              selectedEditTool={selectedEditTool}
              selectedDrawTool={selectedDrawTool}
              brushSize={brushSize}
              onEdit={handleEdit}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Right Panel - Image Preview (hide for full-width tools) */}
        {!isFullWidthTool && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                <div className="border border-gray-300 rounded overflow-hidden">
                  {originalImage && (
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>

              {editedImage && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Edited ({selectedEditTool})</p>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <img
                      src={editedImage}
                      alt="Edited"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            <ToolSelector selectedTool={selectedEditTool} />
          </div>
        )}
      </div>
    </div>
  );
}
