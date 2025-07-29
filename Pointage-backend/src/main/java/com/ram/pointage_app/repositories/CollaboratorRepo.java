package com.ram.pointage_app.repositories;

import com.ram.pointage_app.entities.Collaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollaboratorRepo extends JpaRepository<Collaborator, Long> {
    Optional<Collaborator> findByEmail(String email);
}
