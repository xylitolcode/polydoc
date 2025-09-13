package com.xylitol.polydoc.entity;

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
    private Boolean required;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}