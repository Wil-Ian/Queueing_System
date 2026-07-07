package com.example.demo.controllers;

import com.example.demo.models.Queue;
import com.example.demo.services.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
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

    @GetMapping("/window-queue")
    public List<Queue> getWindowQueue(@RequestParam Integer windowId) {
        return queueService.getWindowQueue(windowId);
    }

    @GetMapping("/reports/daily-volume")
    public Long getDailyVolume(@RequestParam Integer windowId) {
        return queueService.getDailyVolume(windowId);
    }

    @GetMapping("/live-status")
    public ResponseEntity<Queue> getLiveStatus(@RequestParam Integer windowId) {
        Optional<Queue> currentlyServing = queueService.getCurrentlyServing(windowId);
        return currentlyServing.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/next-person")
    public ResponseEntity<Queue> getNextPerson(@RequestParam Integer windowId) {
        Optional<Queue> priorityQueue = queueService.priorityQueue(windowId);
        return priorityQueue.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/reports/avg-waiting-time")
    public Double getAvgWaitingTime(@RequestParam Integer windowId) {
        return queueService.getAvgWaitingTime(windowId);
    }

    @GetMapping("/reports/avg-service-time")
    public Double getAvgServiceTime(@RequestParam Integer windowId) {
        return queueService.getAvgServiceTime(windowId);
    }

    @GetMapping("/reports/util-rate")
    public Double getUtilizationRate(@RequestParam Integer windowId) {
        return queueService.getUtilizationRate(windowId);
    }

    @GetMapping("/reports/queue-count")
    public Long getCountInQueue(@RequestParam Integer windowId) {
        return queueService.getCountInQueue(windowId);
    }

    @GetMapping("/reports/missed-count")
    public Long getCountMissedToday(@RequestParam Integer windowId) {
        return queueService.getCountMissedToday(windowId);
    }

    @GetMapping("/reports/transfer-count")
    public Long getCountTransferredToday(@RequestParam Integer windowId) {
        return queueService.getCountTransferredToday(windowId);
    }

    @PostMapping
    public Queue createQueue(@RequestBody Queue queue) {
        return queueService.createQueue(queue);
    }

    @PutMapping("/{id}")
    public Queue updateQueue(@PathVariable Integer id, @RequestBody Queue queue) {
        return queueService.updateQueue(id, queue);
    }

    @PutMapping("/{id}/requeue")
    public Queue requeueEntry(@PathVariable Integer id) {
        return queueService.requeueEntry(id);
    }

    @DeleteMapping("/{id}")
    public void deleteQueue(@PathVariable Integer id) {
        queueService.deleteQueue(id);
    }
}