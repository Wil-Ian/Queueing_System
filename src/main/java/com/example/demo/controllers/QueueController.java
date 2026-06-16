package com.example.demo.controllers;


import com.example.demo.models.Queue;
import com.example.demo.services.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/queue")
public class QueueController {

    private final QueueService queueService;

    @Autowired
    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public List<Queue> getAllQueue() {
        return queueService.getAllQueues();
    }

    @PostMapping
    public Queue createQueue(@RequestBody Queue queue) {
        return queueService.createQueue(queue);
    }

}
