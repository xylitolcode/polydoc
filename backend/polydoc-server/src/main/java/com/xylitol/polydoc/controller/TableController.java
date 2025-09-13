package com.xylitol.polydoc.controller;

import com.xylitol.polydoc.entity.Table;
import com.xylitol.polydoc.response.TableResponse;
import com.xylitol.polydoc.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
public class TableController {

    @Autowired
    private TableService tableService;

    // 获取所有表格
    @GetMapping("/list")
    public List<Table> getAllTables() {
        return tableService.getAllTables();
    }

    // 创建新表格
    @PostMapping("/create")
    public Table createTable(@RequestBody Table table) {
        return tableService.createTable(table);
    }

    // 获取表格数据
    @GetMapping("/detail/{id}")
    public TableResponse getTable(@PathVariable("id") Long id) {
        return tableService.getTable(id);
    }

    // 保存表格数据
    @PostMapping("/save/{id}")
    public void saveTable(@PathVariable("id") Long id, @RequestBody Table table) {
        tableService.saveTable(id, table);
    }
    
    // 删除表格
    @DeleteMapping("/delete/{id}")
    public void deleteTable(@PathVariable("id") Long id) {
        tableService.deleteTable(id);
    }
}