'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, CheckCircle, XCircle, ArrowRight, Search, Eye, RefreshCw } from 'lucide-react';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

export default function SmartCasesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      setIsAdmin(true);
      fetchCases();
    }
  }, [page]);

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
      setAuthError('验证失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/smart-cases?page=${page}&page_size=${pageSize}`);
      const result = await response.json();
      if (result.success) {
        setCases(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此案例？')) return;
    try {
      const response = await fetch(`/api/admin/smart-cases?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCases(cases.filter(c => c.id !== id));
        setTotal(total - 1);
      }
    } catch {
      alert('删除失败');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/smart-cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setCases(cases.map(c => c.id === id ? { ...c, status } : c));
      }
    } catch {
      alert('更新失败');
    }
  };

  // 转为正式案例
  const handleConvert = async (smartCase: any) => {
    if (!confirm(`将 "${smartCase.title}" 转为正式案例？`)) return;
    setConverting(smartCase.id);
    try {
      const caseData = {
        title: smartCase.title,
        description: smartCase.description || smartCase.content || '',
        architect: smartCase.architect || '',
        location: smartCase.location || [],
        tags: smartCase.tags || [],
        case_type: smartCase.case_type || '',
        source: smartCase.source_url || smartCase.url || '',
        images: smartCase.images || [],
      };

      const response = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData),
      });

      if (response.ok) {
        await handleStatusUpdate(smartCase.id, 'converted');
        alert('转换成功');
      } else {
        const result = await response.json();
        alert(result.error || '转换失败');
      }
    } catch {
      alert('转换失败');
    } finally {
      setConverting(null);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { text: '待审核', class: 'bg-yellow-100 text-yellow-700' };
      case 'approved': return { text: '已审核', class: 'bg-green-100 text-green-700' };
      case 'rejected': return { text: '已拒绝', class: 'bg-red-100 text-red-700' };
      case 'converted': return { text: '已转正', class: 'bg-blue-100 text-blue-700' };
      default: return { text: status || '未知', class: 'bg-slate-100 text-slate-700' };
    }
  };

  const totalPages = Math.ceil(total / pageSize);

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
            <input type="password" placeholder="输入管理员密码" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} disabled={authLoading} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button onClick={handleLogin} disabled={authLoading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">{authLoading ? '验证中...' : '验证'}</button>
            <button onClick={() => router.push('/')} className="w-full px-4 py-2 text-slate-500 hover:text-slate-700 text-sm">返回首页</button>
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
              <h1 className="text-2xl font-bold text-slate-900">全网案例管理</h1>
              <span className="text-sm text-slate-400">共 {total} 条</span>
            </div>
            <button onClick={fetchCases} className="flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50">
              <RefreshCw className="w-4 h-4 mr-1" /> 刷新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12"><p className="text-slate-500">加载中...</p></div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12"><p className="text-slate-500">暂无全网案例数据</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">标题</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">来源</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">状态</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">创建时间</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => {
                  const sl = statusLabel(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 truncate max-w-xs">{c.title}</p>
                        {c.case_type && <span className="text-xs text-slate-400">{c.case_type}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.source_url || c.url ? (
                          <a href={c.source_url || c.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[150px] block">
                            {c.source_name || '链接'}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${sl.class}`}>{sl.text}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => setSelectedCase(c)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50" title="查看">
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusUpdate(c.id, 'approved')} className="p-1.5 text-slate-400 hover:text-green-600 rounded hover:bg-green-50" title="通过">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleStatusUpdate(c.id, 'rejected')} className="p-1.5 text-slate-400 hover:text-orange-600 rounded hover:bg-orange-50" title="拒绝">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {c.status !== 'converted' && (
                            <button onClick={() => handleConvert(c)} disabled={converting === c.id} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50" title="转为正式案例">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <p className="text-sm text-slate-500">第 {page}/{totalPages} 页</p>
                <div className="flex space-x-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50">上一页</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50">下一页</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{selectedCase.title}</h3>
                <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                {selectedCase.description && <p className="text-slate-600">{selectedCase.description}</p>}
                {selectedCase.content && !selectedCase.description && <p className="text-slate-600">{selectedCase.content}</p>}
                {selectedCase.architect && <p><span className="text-slate-500">建筑师：</span>{selectedCase.architect}</p>}
                {selectedCase.location && <p><span className="text-slate-500">地点：</span>{Array.isArray(selectedCase.location) ? selectedCase.location.join(' · ') : selectedCase.location}</p>}
                {selectedCase.case_type && <p><span className="text-slate-500">类型：</span>{selectedCase.case_type}</p>}
                {selectedCase.tags && Array.isArray(selectedCase.tags) && <p><span className="text-slate-500">标签：</span>{selectedCase.tags.join(', ')}</p>}
                {selectedCase.source_url && <p><span className="text-slate-500">来源：</span><a href={selectedCase.source_url} target="_blank" className="text-blue-600 hover:underline">{selectedCase.source_url}</a></p>}
                {selectedCase.images && Array.isArray(selectedCase.images) && selectedCase.images.length > 0 && (
                  <div>
                    <p className="text-slate-500 mb-2">图片 ({selectedCase.images.length})：</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedCase.images.slice(0, 6).map((img: any, i: number) => (
                        <img key={i} src={typeof img === 'string' ? img : img.url} alt="" className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                {selectedCase.status !== 'converted' && (
                  <button onClick={() => { handleConvert(selectedCase); setSelectedCase(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">转为正式案例</button>
                )}
                <button onClick={() => setSelectedCase(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50">关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
