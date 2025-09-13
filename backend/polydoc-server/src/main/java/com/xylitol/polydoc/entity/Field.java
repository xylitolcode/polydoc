package com.xylitol.polydoc.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("fields")
public class Field {
    private Long id;
    private Long tableId;
    private String name;
    private String fieldType;
    private Boolean isRequired;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 临时字段，用于保存字段的临时ID
     */
    @TableField(exist = false)
    private Long tempId;
}