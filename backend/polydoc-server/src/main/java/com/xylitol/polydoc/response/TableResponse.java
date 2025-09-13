package com.xylitol.polydoc.response;

import com.xylitol.polydoc.entity.Field;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TableResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 列属性
     */
    private List<Field> columns;

    /**
     * 行
     */
    private List<RowResponse> rows;
}
