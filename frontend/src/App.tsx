import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';

// 表类型定义
type Table = {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

function App() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState<string>('新表格'); // 用于输入新表名

  // 获取所有表格
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tables/list');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTables(data);
      
      // 如果有表格，默认选择第一个
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0]);
      }
    } catch (err) {
      console.error('获取表格列表失败:', err);
      setError('获取表格列表失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 创建新表
  const createNewTable = async () => {
    try {
      const newTable = {
        name: newTableName || '新表格',
        description: ''
      };

      const response = await fetch('/api/tables/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdTable = await response.json();
      setTables([...tables, createdTable]);
      setSelectedTable(createdTable);
      setNewTableName('新表格'); // 重置输入框
    } catch (err) {
      console.error('创建新表失败:', err);
      alert('创建新表失败: ' + (err as Error).message);
    }
  };

  // 删除表格
  const deleteTable = async (tableId: number, tableName: string) => {
    if (!window.confirm(`确定要删除表格 "${tableName}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tables/delete/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 更新状态
      const updatedTables = tables.filter(table => table.id !== tableId);
      setTables(updatedTables);
      
      // 如果删除的是当前选中的表格，则取消选中
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable(updatedTables.length > 0 ? updatedTables[0] : null);
      }
      
      alert('删除成功');
    } catch (err) {
      console.error('删除表格失败:', err);
      alert('删除表格失败: ' + (err as Error).message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          错误: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* 左侧边栏 - 表格列表 */}
      <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">多维表格</h1>
          <div className="flex">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l px-2 py-1 text-sm"
              placeholder="输入表格名称"
            />
            <button
              onClick={createNewTable}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-r text-sm"
            >
              新增
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tables.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">暂无表格</div>
          ) : (
            <ul>
              {tables.map((table) => (
                <li key={table.id} className="flex items-center group">
                  <button
                    onClick={() => setSelectedTable(table)}
                    className={`flex-1 text-left px-4 py-3 hover:bg-gray-200 transition-colors ${
                      selectedTable?.id === table.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium">{table.name}</div>
                    {table.description && (
                      <div className="text-sm text-gray-500 mt-1 truncate">{table.description}</div>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTable(table.id, table.name);
                    }}
                    className="hidden group-hover:block mr-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 右侧内容区 - 表格详情 */}
      <div className="flex-1 flex flex-col">
        {selectedTable ? (
          <DataTable tableId={selectedTable.id} onTableUpdated={fetchTables} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-500 mb-2">请选择一个表格</h2>
              <p className="text-gray-400">从左侧列表中选择一个表格或创建新表格</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;