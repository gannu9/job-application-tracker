package com.su.jobtracker.repository;

import com.su.jobtracker.model.ApplicationStatus;
import com.su.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    @Query("""
        SELECT j FROM JobApplication j
        WHERE (:q IS NULL OR
            LOWER(j.company) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(j.position) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(COALESCE(j.location, '')) LIKE LOWER(CONCAT('%', :q, '%')))
        AND (:status IS NULL OR j.status = :status)
        ORDER BY j.appliedDate DESC, j.createdAt DESC
        """)
    List<JobApplication> search(
        @Param("q") String q,
        @Param("status") ApplicationStatus status
    );

    long countByStatus(ApplicationStatus status);
}
