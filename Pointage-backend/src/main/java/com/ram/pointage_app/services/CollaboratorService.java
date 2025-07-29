package com.ram.pointage_app.services;

import com.ram.pointage_app.entities.Collaborator;
import com.ram.pointage_app.repositories.CollaboratorRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollaboratorService {
    private final CollaboratorRepo collaboratorRepo;
    public CollaboratorService(CollaboratorRepo collaboratorRepo) {
        this.collaboratorRepo = collaboratorRepo;
    }

    public List<Collaborator> getCollaborators() {
        return collaboratorRepo.findAll();
    }

    public Optional<Collaborator> getCollaborator(Long id) {
        return collaboratorRepo.findById(id);
    }

    public Collaborator createCollaborator(Collaborator collaborator) {
        return collaboratorRepo.save(collaborator);
    }

    public Collaborator updateCollaborator(Long id,Collaborator collaborator) {
        Optional<Collaborator> optional = collaboratorRepo.findById(id);
        if (optional.isPresent()) {
            Collaborator updated=optional.get();
            updated.setFirstname(collaborator.getFirstname());
            updated.setLastname(collaborator.getLastname());
            updated.setEmail(collaborator.getEmail());
            updated.setPhone(collaborator.getPhone());
            collaboratorRepo.save(updated);
        }
        return optional.get();
    }

    public String deleteCollaborator(Long id) {
        if (collaboratorRepo.existsById(id)) {
            collaboratorRepo.deleteById(id);
            return "Collaborator deleted";
        }
        return "Collaborator not found";
    }
}
