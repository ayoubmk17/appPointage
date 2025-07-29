package com.ram.pointage_app.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public Long id;
    public String macAddress;
    public String ordName;

    @OneToOne
    @JsonIgnore
    public Collaborator collaborator;

}
