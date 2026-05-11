'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, PlusCircle, Upload, Download } from 'lucide-react';
import CaseForm from '@/components/admin/CaseForm';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      setIsAdmin(true);
      fetchCases();
    }
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, result.token);
        setIsAdmin(true);
        fetchCases();
      } else {
        setAuthError(result.error || '密码错误');
      }
    } catch {
      setAuthError('验证失败，请重试');
    } finally {
      setAuthLoading(false);
    }
  };

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
      } else {
        const result = await response.json();
        alert(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  // 批量导入
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);

    try {
      const text = await file.text();
      const importedCases = JSON.parse(text);
      const casesArray = Array.isArray(importedCases) ? importedCases : [importedCases];

      let successCount = 0;
      let errorCount = 0;

      for (const caseData of casesArray) {
        try {
          const response = await fetch('/api/admin/cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData)
          });
          if (response.ok) successCount++;
          else errorCount++;
        } catch {
          errorCount++;
        }
      }

      alert(`导入完成：成功 ${successCount} 个，失败 ${errorCount} 个`);
      fetchCases();
    } catch {
      alert('JSON 文件解析失败');
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  // 导出
  const handleExport = () => {
    const dataStr = JSON.stringify(cases, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['住宅', '商业', '公共建筑', '文化建筑', '工业建筑', '其他'];

  // 未登录时显示密码验证页
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">管理员验证</h1>
            <p className="text-sm text-slate-500 mt-1">请输入管理员密码</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="输入管理员密码"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={authLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {authLoading ? '验证中...' : '验证'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 text-slate-500 hover:text-slate-700 text-sm"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
              <h1 className="text-2xl font-bold text-slate-900">案例管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                {importLoading ? '导入中...' : '导入'}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importLoading} />
              </label>
              <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50"
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </button>
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
                  <div className="aspect-video overflow-hidden rounded-t-lg">
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
                  {c.case_type && (
                    <p className="text-sm text-slate-500 mb-1">
                      类型：{c.case_type}
                    </p>
                  )}
                  {c.architect && (
                    <p className="text-sm text-slate-500 mb-1 truncate">
                      建筑师：{c.architect}
                    </p>
                  )}
                  {c.location && (
                    <p className="text-sm text-slate-500 mb-1">
                      地点：{Array.isArray(c.location) ? c.location.join(' · ') : c.location}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">❤️ {c.likes_count || 0}</span>
                      <span className="text-xs text-slate-400">💬 {c.reviews_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/cases/${c.id}`)}
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

      {/* 新增表单 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CaseForm
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">删除确认</h3>
            <p className="text-slate-600 mb-4">确定要删除这个案例吗？此操作不可恢复。</p>
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
