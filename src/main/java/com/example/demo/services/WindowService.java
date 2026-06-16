package com.example.demo.services;

import com.example.demo.models.Window;
import com.example.demo.repositories.WindowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WindowService {

    private final WindowRepository windowRepository;

    @Autowired
    public WindowService(WindowRepository windowRepository) {
        this.windowRepository = windowRepository;
    }

    public List<Window> getAllWindows() {
        return windowRepository.findAll();
    }

    public Window createWindow(Window window) {
        return windowRepository.save(window);
    }
}
