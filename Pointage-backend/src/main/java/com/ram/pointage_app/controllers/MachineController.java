package com.ram.pointage_app.controllers;

import com.ram.pointage_app.entities.Machine;
import com.ram.pointage_app.services.CollaboratorService;
import com.ram.pointage_app.services.MachineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins="http://localhost:3000")
@RequestMapping("/mach")

public class MachineController {
    private final MachineService machineService;
    private final CollaboratorService collaboratorService;

    public MachineController(MachineService machineService, CollaboratorService collaboratorService) {
        this.machineService = machineService;
        this.collaboratorService = collaboratorService;
    }

    @GetMapping
    public ResponseEntity<List<Machine>> getMachines() {
        return ResponseEntity.ok(machineService.getMachines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional> getMachine(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getMachine(id));
    }

    @GetMapping("/ordName")
    public String getOrdName() {
        return machineService.getOrdName();
    }

    @GetMapping("/mac")
    public String getMacAddress() {
        return machineService.getMacAddress();
    }

    @PostMapping
    public ResponseEntity<Machine> createMachine(@RequestBody Machine machine) {
        return ResponseEntity.ok(machineService.createMachine(machine));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.deleteMachine(id));
    }
}
