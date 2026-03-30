'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, PlusCircle } from 'lucide-react';
import CaseForm from '@/components/admin/CaseForm';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/admin/cases?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setCases(result.data);
      }
    } catch (error) {
      console.error('获取案例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个案例吗？')) return;

    try {
      const response = await fetch(`/api/admin/cases/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCases(cases.filter(c => c.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const method = editingCase ? 'PUT' : 'POST';
      const url = editingCase
        ? `/api/admin/cases/${editingCase.id}`
        : '/api/admin/cases';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setIsFormOpen(false);
        setEditingCase(null);
        fetchCases();
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const categories = ['住宅', '商业', '公共建筑', '文化建筑', '工业建筑', '其他'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">案例管理</h1>
            <button
              onClick={() => {
                setEditingCase(null);
                setIsFormOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              新增案例
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索案例..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 案例列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无案例</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                {c.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={c.image_url}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 truncate">
                    {c.title}
                  </h3>
                  {c.category && (
                    <p className="text-sm text-slate-500 mb-1">
                      分类：{c.category}
                    </p>
                  )}
                  {c.architect && (
                    <p className="text-sm text-slate-500 mb-1">
                      建筑师：{c.architect}
                    </p>
                  )}
                  {c.location && (
                    <p className="text-sm text-slate-500 mb-1">
                      地点：{c.location}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        c.is_published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {c.is_published ? '已发布' : '未发布'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingCase(c);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增/编辑表单 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CaseForm
              initialData={editingCase}
              onSubmit={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingCase(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              删除确认
            </h3>
            <p className="text-slate-600 mb-4">
              确定要删除这个案例吗？此操作不可恢复。
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
