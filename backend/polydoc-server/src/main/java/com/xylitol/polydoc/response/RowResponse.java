package com.xylitol.polydoc.response;

import com.xylitol.polydoc.entity.CellValue;
import lombok.Data;

import java.util.List;

@Data
public class RowResponse {
    /**
     * 行id
     */
    private Long id;
    private Long tableId;

    /**
     * 行的数据
     */
    private List<CellValue> cells;
}
