package com.ram.pointage_app.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Data
@Table

public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private LocalDateTime dateEntree;
    private LocalDateTime dateSortie;
    private int duree;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "collaborator_id", referencedColumnName = "id", nullable = false)
    private Collaborator collaborator;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "machine_id", referencedColumnName = "id", nullable = false)
    private Machine machine;
}
