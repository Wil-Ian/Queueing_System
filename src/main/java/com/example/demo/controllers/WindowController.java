package com.example.demo.controllers;

import com.example.demo.models.Window;
import com.example.demo.services.WindowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/window")
public class WindowController {

    private final WindowService windowService;

    @Autowired
    public WindowController(WindowService windowService) {
        this.windowService = windowService;
    }

    @GetMapping
    public List<Window> getAllWindows() {
        return windowService.getAllWindows();
    }

    @PostMapping
    public Window createWindow(@RequestBody Window window) {
        return windowService.createWindow(window);
    }
}
