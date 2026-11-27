package com.su.jobtracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Size(max = 120)
    public String company;

    @NotBlank
    @Size(max = 120)
    public String position;

    @Size(max = 120)
    public String location;

    @Size(max = 500)
    public String jobUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    public ApplicationStatus status = ApplicationStatus.APPLIED;

    public LocalDate appliedDate = LocalDate.now();

    @Size(max = 4000)
    @Column(length = 4000)
    public String notes;

    public LocalDateTime createdAt = LocalDateTime.now();

    public JobApplication() {}
}
