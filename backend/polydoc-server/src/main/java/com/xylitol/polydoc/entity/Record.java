package com.xylitol.polydoc.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("records")
public class Record {
    private Long id;
    private Long tableId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}