package com.su.jobtracker.controller;

import com.su.jobtracker.model.ApplicationStatus;
import com.su.jobtracker.model.JobApplication;
import com.su.jobtracker.repository.JobApplicationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Object list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ApplicationStatus status) {
        return repository.search(
            q == null || q.isBlank() ? null : q.trim(),
            status
        );
    }

    @GetMapping("/{id}")
    public JobApplication get(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplication application) {
        application.id = null;
        application.createdAt = null;
        if (application.appliedDate == null) {
            application.appliedDate = java.time.LocalDate.now();
        }
        if (application.status == null) {
            application.status = ApplicationStatus.APPLIED;
        }
        return repository.save(application);
    }

    @PutMapping("/{id}")
    public JobApplication update(
            @PathVariable Long id,
            @Valid @RequestBody JobApplication updated) {
        JobApplication existing = get(id);
        existing.company = updated.company;
        existing.position = updated.position;
        existing.location = updated.location;
        existing.jobUrl = updated.jobUrl;
        existing.status = updated.status == null ? ApplicationStatus.APPLIED : updated.status;
        existing.appliedDate = updated.appliedDate;
        existing.notes = updated.notes;
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        repository.deleteById(id);
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", repository.count());
        for (ApplicationStatus status : ApplicationStatus.values()) {
            result.put(status.name().toLowerCase(), repository.countByStatus(status));
        }
        return result;
    }
}
