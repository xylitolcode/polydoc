package com.xylitol.polydoc.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.xylitol.polydoc.entity.CellValue;
import com.xylitol.polydoc.entity.Field;
import com.xylitol.polydoc.entity.Row;
import com.xylitol.polydoc.entity.Table;
import com.xylitol.polydoc.mapper.CellValueMapper;
import com.xylitol.polydoc.mapper.FieldMapper;
import com.xylitol.polydoc.mapper.RowMapper;
import com.xylitol.polydoc.mapper.TableMapper;
import com.xylitol.polydoc.response.RowResponse;
import com.xylitol.polydoc.response.TableResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TableService {
    private final TableMapper tableMapper;
    private final FieldMapper fieldMapper;
    private final RowMapper rowMapper;
    private final CellValueMapper cellValueMapper;


    public List<Table> getAllTables() {
        return tableMapper.selectList(Wrappers.emptyWrapper());
    }

    @Transactional
    public Table createTable(Table table) {
        if (table.getName() == null || table.getName().isEmpty()) {
            table.setName("未命名表格");
        }
        table.setOwnerId(1L);
        table.setCreatedAt(LocalDateTime.now());
        table.setUpdatedAt(LocalDateTime.now());
        tableMapper.insert(table);
        return table;
    }

    public TableResponse getTable(Long id) {
        TableResponse response = new TableResponse();
        Table table = tableMapper.selectById(id);
        if (table != null) {
            response.setId(table.getId());
            response.setName(table.getName());
            response.setDescription(table.getDescription());
            response.setCreatedAt(table.getCreatedAt());
            response.setUpdatedAt(table.getUpdatedAt());
        }
        // 获取列属性
        List<Field> fields = fieldMapper.selectList(Wrappers.<Field>lambdaQuery()
                .eq(Field::getTableId, id)
                .orderByAsc(Field::getPosition)
        );
        response.setColumns(fields);

        // 获取行记录
        List<Row> rows = rowMapper.selectList(Wrappers.<Row>lambdaQuery()
                .eq(Row::getTableId, id)
                .orderByAsc(Row::getId)
        );
        List<RowResponse> rowResponses = new ArrayList<>();
        rows.forEach(row -> {
            RowResponse rowResponse = new RowResponse();
            rowResponse.setId(row.getId());
            rowResponse.setTableId(row.getTableId());
            List<CellValue> cellValues = cellValueMapper.selectList(Wrappers.<CellValue>lambdaQuery()
                    .eq(CellValue::getRowId, row.getId())
                    .orderByAsc(CellValue::getFieldId)
            );
            rowResponse.setCells(cellValues);
            rowResponses.add(rowResponse);
        });
        response.setRows(rowResponses);
        return response;
    }

    @Transactional
    public void saveTable(Long id, Table table) {
        // 更新表信息
        table.setId(id);
        table.setUpdatedAt(LocalDateTime.now());
        tableMapper.updateById(table);

        // ✅ 新增：用于记录临时ID到真实ID的映射
        Map<Long, Long> tempToRealFieldIdMap = new HashMap<>();

        // 更新列信息
        List<Field> fields = table.getFields();
        if (fields != null) {
            for (Field field : fields) {
                field.setTableId(id);
                field.setUpdatedAt(LocalDateTime.now());

                if (field.getId() == null) {
                    // 新增列：设置创建时间并插入
                    field.setCreatedAt(LocalDateTime.now());
                    fieldMapper.insert(field); // 插入后，MyBatis 会自动填充 field.getId()
                    // ✅ 记录映射：前端临时ID -> 数据库生成的真实ID
                    tempToRealFieldIdMap.put(field.getTempId(), field.getId()); // 👈 关键！
                } else {
                    // 已存在列，更新
                    fieldMapper.updateById(field);
                }
            }
        }

        // 更新行信息
        List<Row> rows = table.getRows();
        if (rows != null) {
            for (Row row : rows) {
                row.setTableId(id);
                row.setUpdatedAt(LocalDateTime.now());

                if (row.getId() == null) {
                    row.setCreatedAt(LocalDateTime.now());
                    rowMapper.insert(row); // 插入后 MyBatis 自动填充 row.getId()
                } else {
                    rowMapper.updateById(row);
                }

                // 更新单元格信息
                List<CellValue> cells = row.getCells();
                if (cells != null) {
                    for (CellValue cell : cells) {
                        cell.setRowId(row.getId());
                        cell.setUpdatedAt(LocalDateTime.now());

                        // ✅ 关键修复：如果 fieldId 是临时负数，查找映射，替换为真实 ID
                        Long tempFieldId = cell.getFieldId(); // 如 -1757788407202
                        if (tempFieldId != null && tempFieldId < 0) { // 判断是否为临时ID
                            Long realFieldId = tempToRealFieldIdMap.get(tempFieldId);
                            if (realFieldId != null) {
                                cell.setFieldId(realFieldId); // ✅ 替换为真实列ID
                            } else {
                                // 如果找不到映射，可能是非法数据，可选：跳过或报错
                                throw new IllegalArgumentException("无法找到字段映射: " + tempFieldId);
                            }
                        }
                        // 如果是已存在的列（fieldId > 0），则保持原样，无需修改

                        if (cell.getId() == null) {
                            cell.setCreatedAt(LocalDateTime.now());
                            cellValueMapper.insert(cell);
                        } else {
                            cellValueMapper.updateById(cell);
                        }
                    }
                }
            }
        }
    }
    
    @Transactional
    public void deleteTable(Long id) {
        // 删除相关的单元格数据
        cellValueMapper.delete(Wrappers.<CellValue>lambdaQuery()
                .inSql(CellValue::getRowId, 
                        "SELECT id FROM rows WHERE table_id = " + id));
        
        // 删除相关的行数据
        rowMapper.delete(Wrappers.<Row>lambdaQuery()
                .eq(Row::getTableId, id));
        
        // 删除相关的字段数据
        fieldMapper.delete(Wrappers.<Field>lambdaQuery()
                .eq(Field::getTableId, id));
        
        // 删除表格本身
        tableMapper.deleteById(id);
    }
}