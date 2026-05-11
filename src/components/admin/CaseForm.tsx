'use client';

import { useState } from 'react';
import { X, Upload, Plus, Trash2, Star, Image as ImageIcon } from 'lucide-react';

interface CaseImage {
  id?: string;
  url: string;
  caption: string;
  isMain: boolean;
  order: number;
}

interface CaseFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function CaseForm({ initialData, onSubmit, onCancel }: CaseFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    architect: initialData?.architect || '',
    location: Array.isArray(initialData?.location) ? initialData.location.join(', ') : (initialData?.location || ''),
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : (initialData?.tags || ''),
    scale: initialData?.scale || '',
    investment: initialData?.investment || '',
    participants: initialData?.participants || '',
    start_date: initialData?.start_date || '',
    awards: initialData?.awards || '',
    case_type: initialData?.case_type || '',
    sustainable_goal: initialData?.sustainable_goal || '',
    demo_significance: initialData?.demo_significance || '',
  });

  const [images, setImages] = useState<CaseImage[]>(
    initialData?.images?.length
      ? initialData.images.map((img: any, i: number) => ({
          id: img.id,
          url: img.url || img.image_url || '',
          caption: img.caption || '',
          isMain: img.isMain ?? (i === 0),
          order: img.order ?? i + 1,
        }))
      : []
  );

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('图片上传失败');

      const result = await response.json();
      setImages(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], url: result.url };
        return updated;
      });
    } catch {
      setError('图片上传失败');
    } finally {
      setUploadingIndex(null);
    }
  };

  const addImageSlot = () => {
    setImages(prev => [...prev, { url: '', caption: '', isMain: prev.length === 0, order: prev.length + 1 }]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure one image is main
      if (updated.length > 0 && !updated.some(img => img.isMain)) {
        updated[0].isMain = true;
      }
      return updated.map((img, i) => ({ ...img, order: i + 1 }));
    });
  };

  const setMainImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('标题不能为空');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        location: formData.location ? formData.location.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean) : [],
        tags: formData.tags ? formData.tags.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean) : [],
        images: images.filter(img => img.url).map((img, i) => ({
          ...img,
          order: i + 1,
        })),
      };
      await onSubmit(submitData);
    } catch {
      setError('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {initialData ? '编辑案例' : '新增案例'}
        </h2>
        <button onClick={onCancel} className="p-2 text-slate-500 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <section className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>标题 *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} placeholder="输入案例标题" />
            </div>
            <div>
              <label className={labelClass}>描述</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} placeholder="输入案例描述" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>案例类型</label>
                <input type="text" name="case_type" value={formData.case_type} onChange={handleChange} className={inputClass} placeholder="如：实施项目；已完成" />
              </div>
              <div>
                <label className={labelClass}>建筑师 / 设计方</label>
                <input type="text" name="architect" value={formData.architect} onChange={handleChange} className={inputClass} placeholder="建筑师/设计方信息" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>地点（逗号分隔）</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="如：江苏, 南京, 秦淮" />
                {formData.location && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.location.split(/[,，]/).map((s: string, i: number) => s.trim() && (
                      <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>标签（逗号分隔）</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={inputClass} placeholder="如：宜居, 人文, 绿色" />
                {formData.tags && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.split(/[,，]/).map((s: string, i: number) => s.trim() && (
                      <span key={i} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 项目详情 */}
        <section className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">项目详情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>规模</label>
              <input type="text" name="scale" value={formData.scale} onChange={handleChange} className={inputClass} placeholder="如：用地面积约4.69公顷" />
            </div>
            <div>
              <label className={labelClass}>投资</label>
              <input type="text" name="investment" value={formData.investment} onChange={handleChange} className={inputClass} placeholder="如：21.18亿元" />
            </div>
            <div>
              <label className={labelClass}>参与方</label>
              <input type="text" name="participants" value={formData.participants} onChange={handleChange} className={inputClass} placeholder="参与方信息" />
            </div>
            <div>
              <label className={labelClass}>开始日期</label>
              <input type="text" name="start_date" value={formData.start_date} onChange={handleChange} className={inputClass} placeholder="如：2015年-至今" />
            </div>
          </div>
        </section>

        {/* 特色与荣誉 */}
        <section className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">特色与荣誉</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>获奖情况</label>
              <textarea name="awards" value={formData.awards} onChange={handleChange} rows={2} className={inputClass} placeholder="获奖情况描述" />
            </div>
            <div>
              <label className={labelClass}>可持续目标</label>
              <input type="text" name="sustainable_goal" value={formData.sustainable_goal} onChange={handleChange} className={inputClass} placeholder="如：宜居；人文；绿色" />
            </div>
            <div>
              <label className={labelClass}>示范意义</label>
              <textarea name="demo_significance" value={formData.demo_significance} onChange={handleChange} rows={2} className={inputClass} placeholder="示范意义描述" />
            </div>
          </div>
        </section>

        {/* 图片管理 */}
        <section className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">图片</h3>
            <button type="button" onClick={addImageSlot} className="flex items-center text-sm text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4 mr-1" /> 添加图片
            </button>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">点击"添加图片"上传案例图片</p>
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((img, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded border border-slate-200">
                  {/* 上传区域 */}
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    {img.url ? (
                      <img src={img.url} alt={img.caption} className="w-24 h-24 object-cover rounded" />
                    ) : (
                      <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-blue-400">
                        {uploadingIndex === index ? (
                          <span className="text-xs text-slate-400">上传中...</span>
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400" />
                        )}
                        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(index, f); }} className="hidden" />
                      </label>
                    )}
                    {img.isMain && (
                      <span className="absolute -top-1 -left-1 bg-yellow-400 text-white text-xs px-1 rounded">主图</span>
                    )}
                  </div>

                  {/* 图片信息 */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => updateImageCaption(index, e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-sm mb-1"
                      placeholder="图片说明"
                    />
                    <div className="flex items-center gap-2">
                      {!img.url && (
                        <label className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                          选择文件
                          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(index, f); }} className="hidden" />
                        </label>
                      )}
                      <button type="button" onClick={() => setMainImage(index)} className={`text-xs ${img.isMain ? 'text-yellow-600 font-medium' : 'text-slate-400 hover:text-yellow-600'}`}>
                        <Star className="w-3 h-3 inline" /> 设为主图
                      </button>
                    </div>
                  </div>

                  {/* 删除 */}
                  <button type="button" onClick={() => removeImage(index)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 提交按钮 */}
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
