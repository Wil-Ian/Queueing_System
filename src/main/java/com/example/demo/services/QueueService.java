package com.example.demo.services;

import com.example.demo.models.Queue;
import com.example.demo.repositories.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QueueService {

    private final QueueRepository queueRepository;

    @Autowired
    public QueueService(QueueRepository queueRepository) {
        this.queueRepository = queueRepository;
    }

    public List<Queue> getAllQueues() {
        return queueRepository.findAll();
    }

    public Queue createQueue(Queue queue) {
        return queueRepository.save(queue);
    }
}
