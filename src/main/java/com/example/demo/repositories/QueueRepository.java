package com.example.demo.repositories;

import com.example.demo.models.Queue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// The type after the model is the primary key
public interface QueueRepository extends JpaRepository<Queue, Integer> {
    List<Queue> findByIsActiveTrue();
    List<Queue> findByIsActiveTrueAndWindowId(Integer windowId);

    Optional<Queue> findByIsActiveTrueAndWindowIdAndStatusServing(Integer windowId);

    @Query(value = "SELECT COUNT(*) FROM queue WHERE window_id = :windowId AND DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Long countCompletedToday(@Param("windowId") Integer windowId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (serving_started_at - time_stamp))/60) FROM queue WHERE window_id = :windowId AND DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double avgWaitingTimeToday(@Param("windowId") Integer windowId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (completed_at - serving_started_at))/60) FROM queue WHERE window_id = :windowId AND DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double avgServiceTimeToday(@Param("windowId") Integer windowId);

    @Query(value = "SELECT SUM(EXTRACT(EPOCH FROM (completed_at - serving_started_at))/60) / (SELECT COUNT(*) FROM \"window\" WHERE window_id = :windowId AND is_active = true) / (9 * 60) * 100 FROM queue WHERE DATE(completed_at) = CURRENT_DATE AND status = 'COMPLETED'", nativeQuery = true)
    Double utilizationRate(@Param("windowId") Integer windowId);

    @Query(value = "SELECT COUNT(*) FROM queue WHERE window_id = :windowId AND status IN ('WAITING', 'TRANSFERRED')", nativeQuery = true)
    Long countInQueue(@Param("windowId") Integer windowId);

    @Query(value = "SELECT COUNT(*) FROM queue WHERE window_id = :windowId AND DATE(completed_at) = CURRENT_DATE AND status = 'NO_RESPONSE'", nativeQuery = true)
    Long countMissedToday(@Param("windowId") Integer windowId);

    @Query(value = "SELECT COUNT(*) FROM queue WHERE window_id = :windowId AND DATE(time_stamp) = CURRENT_DATE AND status = 'TRANSFERRED'", nativeQuery = true)
    Long countTransferredToday(@Param("windowId") Integer windowId);
}
