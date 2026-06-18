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

    @GetMapping("/reports/daily-volume")
    public Long getDailyVolume() {
        return queueService.getDailyVolume();
    }

    @GetMapping("/reports/avg-waiting-time")
    public Double getAvgWaitingTime() {
        return queueService.getAvgWaitingTime();
    }

    @GetMapping("/reports/avg-service-time")
    public Double getAvgServiceTime() {
        return queueService.getAvgServiceTime();
    }

    @GetMapping("/reports/util-rate")
    public Double getUtilizationRate() {
        return queueService.getUtilizationRate();
    }

    @PostMapping
    public Queue createQueue(@RequestBody Queue queue) {
        return queueService.createQueue(queue);
    }

    @PutMapping("/{id}")
    public Queue updateQueue(@PathVariable Integer id, @RequestBody Queue queue) {
        return queueService.updateQueue(id, queue);
    }

    @DeleteMapping("/{id}")
    public void deleteQueue(@PathVariable Integer id) {
        queueService.deleteQueue(id);
    }
}


