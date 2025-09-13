package com.xylitol.polydoc.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("tables")
public class Table {
    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 用于保存操作时传输行和列数据
    @TableField(exist = false)
    private List<Field> fields;

    @TableField(exist = false)
    private List<Row> rows;
}