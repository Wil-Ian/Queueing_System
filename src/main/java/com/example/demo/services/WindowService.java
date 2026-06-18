package com.example.demo.services;

import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Window;
import com.example.demo.repositories.WindowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WindowService {

    private final WindowRepository windowRepository;

    @Autowired
    public WindowService(WindowRepository windowRepository) {
        this.windowRepository = windowRepository;
    }

    public List<Window> getAllWindows() {
        return windowRepository.findByIsActiveTrue();
    }

    public Window createWindow(Window window) {
        return windowRepository.save(window);
    }

    public Window updateWindow(Integer id, Window updatedWindow) {
        Optional<Window> exisingWindow = windowRepository.findById(id);
        if(exisingWindow.isPresent()) {
            Window window = exisingWindow.get();
            window.setQueue(updatedWindow.getQueue());
            return windowRepository.save(window);
        }
        throw new ResourceNotFoundException("Window with ID " + id + " not found");
    }

    public void deleteWindow(Integer id) {
        Optional<Window> existingWindow = windowRepository.findById(id);
        if(existingWindow.isPresent()) {
            Window window = existingWindow.get();
            window.setActive(false);
            windowRepository.save(window);
        } else {
            throw new ResourceNotFoundException("Window with ID " + id + " not found");
        }
    }
}
