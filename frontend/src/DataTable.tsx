import React, { useState, useEffect, useRef } from "react";

// 数据类型定义
type Column = {
  id: number;
  name: string;
  type: string; // text | number | date | relation...
  position: number;
};

type Cell = {
  id: number;
  rowId: number;
  fieldId: number;
  valueText: string | null;
  valueNum: number | null;
  valueBool: boolean | null;
  valueDate: string | null;
  valueJson: string | null;
};

type Row = {
  id: number;
  tableId: number;
  cells: Cell[];
};

type TableData = {
  id: number;
  name: string;
  columns: Column[];
  rows: Row[];
};

// 添加props类型定义
type DataTableProps = {
  tableId: number;
  onTableUpdated?: () => void;
};

export default function DataTable({ tableId, onTableUpdated }: DataTableProps) {
  // 初始化一个最小表格
  const [table, setTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  // 获取表格数据
  useEffect(() => {
    // 避免在React StrictMode下重复调用API
    if (initialized.current) {
      return;
    }
    
    initialized.current = true;
    
    const fetchTableData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tables/detail/${tableId}`); // 使用传入的tableId
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // 转换后端数据格式为前端所需格式
        const convertedData = convertTableData(data);
        setTable(convertedData);
      } catch (err) {
        console.error("获取表格数据失败:", err);
        setError("获取表格数据失败: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [tableId]); // 添加tableId作为依赖项

  // 当tableId变化时，重置initialized标志以允许重新获取数据
  useEffect(() => {
    initialized.current = false;
  }, [tableId]);

  // 转换后端数据格式为前端所需格式
  const convertTableData = (data: any): TableData => {
    const columns: Column[] = data.columns?.map((col: any) => ({
      id: col.id,
      name: col.name,
      type: col.fieldType || "text",
      position: col.position || 0,
    })) || [];

    const rows: Row[] = data.rows?.map((row: any) => {
      return {
        id: row.id,
        tableId: row.tableId,
        cells: row.cells || [],
      };
    }) || [];

    return {
      id: data.id || 1,
      name: data.name || "默认表格",
      columns,
      rows,
    };
  };

  // 保存表格数据到后端
  const saveTableData = async () => {
    if (!table) return;

    try {
      const response = await fetch(`/api/tables/save/${tableId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(convertTableDataToRequest(table)),
      });

      if (!response.ok) {
        throw new Error(`保存失败! status: ${response.status}`);
      }

      alert("保存成功");
      // 保存成功后触发回调
      if (onTableUpdated) {
        onTableUpdated();
      }
    } catch (err) {
      console.error("保存表格数据失败:", err);
      alert("保存表格数据失败: " + (err as Error).message);
    }
  };

  // 转换前端数据格式为后端所需格式
  const convertTableDataToRequest = (data: TableData): any => {
    return {
      id: data.id,
      name: data.name,
      fields: data.columns.map((col) => ({
        id: col.id > 0 ? col.id : null, // 新增列ID为负数或0，设为null
        tempId: col.id,
        tableId: data.id,
        name: col.name,
        fieldType: col.type,
        position: col.position,
      })),
      rows: data.rows.map((row) => ({
        id: row.id > 0 ? row.id : null, // 新增行ID为负数或0，设为null
        tableId: data.id,
        cells: row.cells.map((cell) => ({
          id: cell.id > 0 ? cell.id : null,
          fieldId: cell.fieldId,
          valueText: cell.valueText,
          valueNum: cell.valueNum,
          valueBool: cell.valueBool,
          valueDate: cell.valueDate,
          valueJson: cell.valueJson,
        })),
      })),
    };
  };

  // 编辑单元格
  const updateCell = (rowId: number, fieldId: number, value: string) => {
    if (!table) return;
    
    setTable((prev) => {
      if (!prev) return null;
      
      const newRows = prev.rows.map((row) => {
        if (row.id === rowId) {
          // 查找单元格是否已存在
          const cellIndex = row.cells.findIndex(cell => cell.fieldId === fieldId);
          
          if (cellIndex >= 0) {
            // 如果单元格已存在，更新它的值
            const newCells = [...row.cells];
            newCells[cellIndex] = {
              ...newCells[cellIndex],
              valueText: value,
            };
            return { ...row, cells: newCells };
          } else {
            // 如果单元格不存在，创建新单元格
            const newCell: Cell = {
              id: -(Date.now()), // 使用负数ID表示新增
              rowId: rowId,
              fieldId: fieldId,
              valueText: value,
              valueNum: null,
              valueBool: null,
              valueDate: null,
              valueJson: null,
            };
            return { ...row, cells: [...row.cells, newCell] };
          }
        }
        return row;
      });
      
      return { ...prev, rows: newRows };
    });
  };

  // 编辑列名
  const updateColumnName = (columnId: number, newName: string) => {
    if (!table) return;
    
    setTable((prev) => {
      if (!prev) return null;
      
      const newColumns = prev.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, name: newName };
        }
        return col;
      });
      
      return { ...prev, columns: newColumns };
    });
  };

  // 增加行
  const addRow = () => {
    if (!table) return;
    
    const newId = -(Date.now()); // 使用负数ID表示新增
    const emptyCells: Cell[] = table.columns.map((col) => ({
      id: -(Date.now() + col.id), // 生成唯一的负数ID
      rowId: newId,
      fieldId: col.id,
      valueText: "",
      valueNum: null,
      valueBool: null,
      valueDate: null,
      valueJson: null,
    }));
    
    setTable((prev) => {
      if (!prev) return null;
      
      return {
        ...prev,
        rows: [...prev.rows, { id: newId, tableId: prev.id, cells: emptyCells }],
      }
    });
  };

  // 增加列
  const addColumn = () => {
    if (!table) return;
    
    const newId = -(Date.now());
    setTable((prev) => {
      if (!prev) return null;
      
      const newColumn: Column = {
        id: newId,
        tempId: newId,
        name: `列${prev.columns.length + 1}`,
        type: "text",
        position: prev.columns.length,
      };
      
      // 为现有行添加新列的空单元格
      const newRows = prev.rows.map((row) => {
        const newCell: Cell = {
          id: -(Date.now() + row.id), // 生成唯一的负数ID
          rowId: row.id,
          fieldId: newId,
          valueText: "",
          valueNum: null,
          valueBool: null,
          valueDate: null,
          valueJson: null,
        };
        return {
          ...row,
          cells: [...row.cells, newCell],
        };
      });
      
      return {
        ...prev,
        columns: [...prev.columns, newColumn],
        rows: newRows,
      };
    });
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!table) {
    return <div>无数据</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{table.name}</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {table.columns.map((col) => (
                <th key={col.id} className="border px-2 py-1 bg-gray-100">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateColumnName(col.id, e.target.value)}
                    className="w-full outline-none font-bold bg-gray-100 text-center"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.id}>
                {table.columns.map((col) => {
                  // 查找对应单元格
                  const cell = row.cells.find(c => c.fieldId === col.id);
                  return (
                    <td key={col.id} className="border px-2 py-1">
                      <input
                        type="text"
                        value={cell?.valueText || cell?.valueText === "" ? cell.valueText : ""}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        className="w-full outline-none"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-x-2">
        <button
          onClick={addRow}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          ➕ 增加行
        </button>
        <button
          onClick={addColumn}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          ➕ 增加列
        </button>
        <button
          onClick={saveTableData}
          className="px-3 py-1 bg-purple-500 text-white rounded"
        >
          💾 保存
        </button>
      </div>
    </div>
  );
}
