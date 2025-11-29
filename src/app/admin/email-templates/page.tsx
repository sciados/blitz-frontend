"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  FileText,
  Mail,
  Users,
} from "lucide-react";

interface EmailTemplate {
  id: number;
  name: string;
  description?: string;
  audience_type?: "product-dev" | "affiliate" | "business";
  subject: string;
  html_content: string;
  text_content?: string;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export default function AdminEmailTemplatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    audience_type: "",
    subject: "",
    html_content: "",
    text_content: "",
    is_default: false,
  });
  const [previewData, setPreviewData] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin-email-templates"],
    queryFn: async () => {
      const response = await api.get("/api/admin/email-templates");
      return response.data as EmailTemplate[];
    },
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post("/api/admin/email-templates", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] });
      toast.success("Template created successfully");
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await api.put(`/api/admin/email-templates/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] });
      toast.success("Template updated successfully");
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.get(`/api/admin/email-templates/preview/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      setPreviewData(data);
    },
    onError: (error: any) => {
      toast.error(`Failed to preview template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      audience_type: "",
      subject: "",
      html_content: "",
      text_content: "",
      is_default: false,
    });
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      audience_type: template.audience_type || "",
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || "",
      is_default: template.is_default,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        updates: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (template: EmailTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const getAudienceBadge = (audience_type?: string) => {
    if (!audience_type) return null;
    const colors = {
      "product-dev": "bg-purple-100 text-purple-800",
      "affiliate": "bg-green-100 text-green-800",
      "business": "bg-blue-100 text-blue-800",
    };
    const icons = {
      "product-dev": "🎯",
      "affiliate": "💰",
      "business": "🚀",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[audience_type as keyof typeof colors]
        }`}
      >
        <span className="mr-1">{icons[audience_type as keyof typeof icons]}</span>
        {audience_type}
      </span>
    );
  };

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Email Templates
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Create and manage email templates for different audience types
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Template
          </button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] animate-pulse"
              >
                <div className="h-4 bg-[var(--border-color)] rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-[var(--border-color)] rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-[var(--border-color)] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {template.name}
                      </h3>
                    </div>
                    {template.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {getAudienceBadge(template.audience_type)}
                      {template.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Default
                        </span>
                      )}
                      {template.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Subject:
                  </p>
                  <p className="text-sm text-[var(--text-primary)] truncate">
                    {template.subject}
                  </p>
                </div>

                <div className="text-xs text-[var(--text-secondary)] mb-4">
                  v{template.version} • Updated {new Date(template.updated_at).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => previewMutation.mutate(template.id)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-[var(--text-primary)] rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {editingTemplate ? "Edit Template" : "Create New Template"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Audience Type
                      </label>
                      <select
                        value={formData.audience_type}
                        onChange={(e) =>
                          setFormData({ ...formData, audience_type: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      >
                        <option value="">All Audiences</option>
                        <option value="product-dev">Product Developers</option>
                        <option value="affiliate">Affiliates</option>
                        <option value="business">Businesses</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      required
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Variables: {'{{first_name}}'}, {'{{signup_date}}'}, {'{{unsubscribe_url}}'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      HTML Content *
                    </label>
                    <textarea
                      value={formData.html_content}
                      onChange={(e) =>
                        setFormData({ ...formData, html_content: e.target.value })
                      }
                      rows={12}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Plain Text Content
                    </label>
                    <textarea
                      value={formData.text_content}
                      onChange={(e) =>
                        setFormData({ ...formData, text_content: e.target.value })
                      }
                      rows={6}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData({ ...formData, is_default: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-[var(--text-primary)]">
                      Set as default template for this audience
                    </span>
                  </label>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingTemplate
                      ? "Update Template"
                      : "Create Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Email Preview
                  </h2>
                  <button
                    onClick={() => setPreviewData(null)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Subject: {previewData.subject}
                  </p>
                </div>

                <div
                  className="bg-white rounded-lg p-8 border"
                  dangerouslySetInnerHTML={{ __html: previewData.html_content }}
                />

                {previewData.text_content && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Plain Text Version:
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 whitespace-pre-wrap text-sm text-[var(--text-primary)]">
                      {previewData.text_content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
