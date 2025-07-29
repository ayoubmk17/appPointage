package com.ram.pointage_app.controllers;

import com.ram.pointage_app.entities.Collaborator;
import com.ram.pointage_app.services.CollaboratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/collab")
public class CollaboratorController {

    private final CollaboratorService collaboratorService;

    public CollaboratorController(CollaboratorService collaboratorService) {
        this.collaboratorService = collaboratorService;
    }

    @GetMapping
    public ResponseEntity<List<Collaborator>> getCollaborators() {
        return ResponseEntity.ok(collaboratorService.getCollaborators());

    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Collaborator>> getCollaboratorById(@PathVariable Long id) {
        return ResponseEntity.ok(collaboratorService.getCollaborator(id));
    }

    @PostMapping
    public ResponseEntity<Collaborator> createCollaborator(@RequestBody Collaborator collaborator) {
        return ResponseEntity.ok(collaboratorService.createCollaborator(collaborator));

    }

    @PutMapping("/{id}")
    public ResponseEntity<Collaborator>  updateCollaborator(@PathVariable Long id, @RequestBody Collaborator collaborator) {
        return ResponseEntity.ok(collaboratorService.updateCollaborator(id, collaborator));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCollaborator(@PathVariable Long id) {
        return ResponseEntity.ok(collaboratorService.deleteCollaborator(id));
    }



}
