package com.xylitol.polydoc.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("cell_values")
public class CellValue {
    private Long id;
    private Long recordId;
    private Long fieldId;
    private String valueText;
    private Double valueNum;
    private Boolean valueBool;
    private LocalDateTime valueDate;
    private String valueJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}