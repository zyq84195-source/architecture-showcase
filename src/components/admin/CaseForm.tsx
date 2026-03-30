'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';

interface CaseFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function CaseForm({ initialData, onSubmit, onCancel }: CaseFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    architect: initialData?.architect || '',
    location: initialData?.location || '',
    year: initialData?.year || '',
    area: initialData?.area || '',
    height: initialData?.height || '',
    style: initialData?.style || '',
    image_url: initialData?.image_url || '',
    is_published: initialData?.is_published !== undefined ? initialData.is_published : true
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('图片上传失败');

      const result = await response.json();
      setFormData({ ...formData, image_url: result.url });
      setImagePreview(result.url);
    } catch (err) {
      setError('图片上传失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {initialData ? '编辑案例' : '新增案例'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-slate-500 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题和图片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              标题 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入案例标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              分类
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：住宅、商业、公共建筑"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            图片
          </label>
          <div className="flex items-start space-x-4">
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-32 h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image_url: '' });
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex-1">
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                选择图片
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {formData.image_url && (
                <p className="mt-2 text-sm text-slate-500">
                  已选择：{formData.image_url}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            描述
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入案例描述"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              建筑师
            </label>
            <input
              type="text"
              name="architect"
              value={formData.architect}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入建筑师姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              地点
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入地点"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              年份
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：2020"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              建筑面积
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              建筑高度
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              风格
            </label>
            <input
              type="text"
              name="style"
              value={formData.style}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：现代简约"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : initialData ? '保存修改' : '创建案例'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
