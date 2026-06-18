package com.example.demo.repositories;

import com.example.demo.models.Queue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

// The type after the model is the primary key
public interface QueueRepository extends JpaRepository<Queue, Integer> {
    List<Queue> findByIsActiveTrue();

    @Query(value = "SELECT COUNT(*) FROM queue WHERE DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Long countCompletedToday();

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (serving_started_at - time_stamp))/60) FROM queue WHERE DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double avgWaitingTimeToday();

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (completed_at - serving_started_at))/60) FROM queue WHERE DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double avgServiceTimeToday();

    @Query(value = "SELECT SUM(EXTRACT(EPOCH FROM (completed_at - serving_started_at))/60) / (SELECT COUNT(*) FROM \"window\" WHERE is_active = true) / (9 * 60) * 100 FROM queue WHERE DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double utilizationRate();
}
