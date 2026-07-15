package com.example.demo.services;

import com.example.demo.exceptions.InvalidOperationException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.Queue;
import com.example.demo.models.Window;
import com.example.demo.repositories.QueueRepository;
import com.example.demo.repositories.WindowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final WindowRepository windowRepository;

    @Autowired
    public QueueService(QueueRepository queueRepository, WindowRepository windowRepository) {
        this.queueRepository = queueRepository;
        this.windowRepository = windowRepository;
    }

    public List<Queue> getAllQueues() {
        return queueRepository.findByIsActiveTrue();
    }

    public List<Queue> getWindowQueue(Integer windowId) {
        return queueRepository.findByIsActiveTrueAndWindowIdOrderByUserPriorityAscTimeStampAsc(windowId);
    }

    public List<Queue> finishedQueue(Integer windowId) {
        return queueRepository.finishedQueue(windowId);
    }

    public List<Queue> findAllInQueue() {
        return queueRepository.findAllInQueue();
    }

    public List<Queue> findAllServing() {
        return queueRepository.findAllServing();
    }

    public Optional<Queue> getCurrentlyServing(Integer windowId) {
        return queueRepository.findByIsActiveTrueAndWindowIdAndStatus(windowId, "SERVING");
    }

    public Queue createQueue(Queue queue) {
        queue.setTimeStamp(LocalDateTime.now());
        queue.setStatus("WAITING");
        queue.setActive(true);
        return queueRepository.save(queue);
    }

    public Queue updateQueue(Integer id, Queue updatedQueue) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            Integer originalWindowId = queue.getWindowId();
            queue.setWindowId(updatedQueue.getWindowId());
            queue.setStatus(updatedQueue.getStatus());
            if(updatedQueue.getStatus().equals("TRANSFERRED")) {
                Window sourceWindow = windowRepository.findById(originalWindowId)
                        .orElseThrow(() -> new ResourceNotFoundException("Source Window with ID " + originalWindowId + " not found."));
                Window destinationWindow = windowRepository.findById(updatedQueue.getWindowId())
                        .orElseThrow(() -> new ResourceNotFoundException("Destination Window with ID " + updatedQueue.getWindowId() + " not found."));
                boolean allowed = isTransferAllowed(sourceWindow.getCategory(), destinationWindow.getCategory());
                if(!allowed) {
                    throw new InvalidOperationException("Error: This transfer path isn't allowed by business rules.");
                }
            }
            if(updatedQueue.getStatus().equals("SERVING")) {
                queue.setServingStartedAt(LocalDateTime.now());
            }
            if(updatedQueue.getStatus().equals("COMPLETED") || updatedQueue.getStatus().equals("NO_RESPONSE")) {
                queue.setCompletedAt(LocalDateTime.now());
                queue.setActive(false);
            }
            return queueRepository.save(queue);
        }
        throw new ResourceNotFoundException("Queue with ID " + id + " not found.");
    }

    public void deleteQueue(Integer id) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            queue.setActive(false);
            queueRepository.save(queue);
        } else {
            throw new ResourceNotFoundException("Queue with ID " + id + " not found.");
        }
    }
    private static final Map<String, List<String>> ALLOWED_TRANSFERS = Map.of(
            "Receiving", List.of("Evaluation: Operations", "Evaluation: Assessment"),
            "Evaluation: Operations", List.of("Releasing/Follow Up"),
            "Evaluation: Assessment", List.of("Releasing/Follow Up"),
            "Releasing/Follow Up", List.of("Cashier"),
            "Information Desk and Pass Control", List.of("Cashier"),
            "Appointment", List.of("Cashier"));

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

    public Long getCountInQueue(Integer windowId) {
        return queueRepository.countInQueue(windowId);
    }

    public Long getCountMissedToday(Integer windowId) {
        return queueRepository.countMissedToday(windowId);
    }

    public Long getCountTransferredToday(Integer transferredFrom) {
        return queueRepository.countTransferredToday(transferredFrom);
    }

    public Optional<Queue> priorityQueue(Integer windowId) {
        return queueRepository.priorityQueue(windowId);
    }

    public Queue requeueEntry(Integer id) {
        Optional<Queue> existingQueue = queueRepository.findById(id);
        if(existingQueue.isPresent()) {
            Queue queue = existingQueue.get();
            if(queue.getStatus().equals("WAITING") || queue.getStatus().equals("SERVING")) {
                if(queue.getCallCount() == null) {
                    queue.setCallCount(0);
                }
                queue.setStatus("WAITING");
                queue.setCallCount(queue.getCallCount() + 1);
                if(queue.getCallCount() >= 2) {
                    queue.setStatus("NO_RESPONSE");
                    queue.setActive(false);
                }
                queue.setTimeStamp(LocalDateTime.now());
                return queueRepository.save(queue);
            } else {
                throw new InvalidOperationException("Error: Client does not have the status 'WAITING'.");
            }
        }
        throw new ResourceNotFoundException("Queue with ID " + id + " not found.");
    }

    private boolean isTransferAllowed(String sourceCategory, String destinationCategory) {
        List<String> allowedDestinations = ALLOWED_TRANSFERS.get(sourceCategory);
        return allowedDestinations != null && allowedDestinations.contains(destinationCategory);
    }
}