package com.ram.pointage_app.controllers;

import com.ram.pointage_app.entities.Shift;
import com.ram.pointage_app.services.ShiftService;
import org.springframework.http.ResponseEntity;
import lombok.*;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shift")
@CrossOrigin(origins = "http://localhost:3000")
public class ShiftController {
    private final ShiftService shiftService;

    @GetMapping
    public ResponseEntity<List<Shift>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getShifts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shift> getShiftById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.getShift(id));
    }

    @PostMapping
    public ResponseEntity<?> createShift(@RequestBody Shift shift) {
        try {
            return ResponseEntity.ok(shiftService.createShift(shift));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShift(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.deleteShift(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shift> updateShift(@PathVariable Long id, @RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.updateShift(id, shift));
    }
}
