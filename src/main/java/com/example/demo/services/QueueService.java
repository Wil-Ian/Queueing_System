package com.example.demo.services;

import com.example.demo.exceptions.InvalidOperationException;
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

    public List<Queue> getWindowQueue(Integer windowId) {
        return queueRepository.findByIsActiveTrueAndWindowId(windowId);
    }

    public Optional<Queue> getCurrentlyServing(Integer windowId) {
        return queueRepository.findByIsActiveTrueAndWindowIdAndStatus(windowId, "SERVING");
    }

    public Queue createQueue(Queue queue) {
        queue.setTimeStamp(LocalDateTime.now());
        queue.setStatus("WAITING");
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
                queue.setActive(false);
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

    public Long getDailyVolume(Integer windowId) {
        return queueRepository.countCompletedToday(windowId);
    }

    public Double getAvgWaitingTime(Integer windowId) {
        return queueRepository.avgWaitingTimeToday(windowId);
    }

    public Double getAvgServiceTime(Integer windowId) {
        return queueRepository.avgServiceTimeToday(windowId);
    }

    public Double getUtilizationRate(Integer windowId) {
        return queueRepository.utilizationRate(windowId);
    }

    public Queue requeueEntry(Integer id) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            if(queue.getStatus().equals("WAITING")) {
                queue.setTimeStamp(LocalDateTime.now());
                return queueRepository.save(queue);
            } else {
                throw new InvalidOperationException("Error: Client does not have the status 'WAITING'");
            }
        }
        throw new ResourceNotFoundException("Queue with ID " + id + " not found");
    }
}