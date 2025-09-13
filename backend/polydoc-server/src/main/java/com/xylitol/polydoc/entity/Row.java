package com.xylitol.polydoc.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("rows")
public class Row {
    private Long id;
    private Long tableId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 用于保存操作时传输单元格数据
    @TableField(exist = false)
    private List<CellValue> cells;
}