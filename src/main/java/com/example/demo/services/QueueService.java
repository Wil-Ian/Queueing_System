package com.example.demo.services;

import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Queue;
import com.example.demo.repositories.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QueueService {

    private final QueueRepository queueRepository;

    @Autowired
    public QueueService(QueueRepository queueRepository) {
        this.queueRepository = queueRepository;
    }

    public List<Queue> getAllQueues() {
        return queueRepository.findByIsActiveTrue();
    }

    public Queue createQueue(Queue queue) {
        return queueRepository.save(queue);
    }

    public Queue updateQueue(Integer id, Queue updatedQueue) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            queue.setWindowId(updatedQueue.getWindowId());
            queue.setStatus(updatedQueue.getStatus());
            if(updatedQueue.getStatus().equals("SERVING")) {
                queue.setServingStartedAt(LocalDateTime.now());
            }
            if(updatedQueue.getStatus().equals("COMPLETED") || updatedQueue.getStatus().equals("NO_RESPONSE")) {
                queue.setCompletedAt(LocalDateTime.now());
            }
            return queueRepository.save(queue);
        }
        throw new ResourceNotFoundException("Queue with ID " + id + " not found");
    }

    public void deleteQueue(Integer id) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            queue.setActive(false);
            queueRepository.save(queue);
        } else {
            throw new ResourceNotFoundException("Queue with ID " + id + " not found");
        }
    }

    public Long getDailyVolume() {
        return queueRepository.countCompletedToday();
    }

    public Double getAvgWaitingTime() {
        return queueRepository.avgWaitingTimeToday();
    }

    public Double getAvgServiceTime() {
        return queueRepository.avgServiceTimeToday();
    }

    public Double getUtilizationRate() {
        return queueRepository.utilizationRate();
    }
}
