package com.ram.pointage_app.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table

public class Collaborator {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public Long id;
    public String firstname;
    public String lastname;

    @Column(unique=true)
    public String email;
    public String phone;

    @OneToOne
    @JsonIgnore
    private Machine machine;

}
