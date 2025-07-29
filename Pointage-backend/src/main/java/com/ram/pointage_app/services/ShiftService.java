package com.ram.pointage_app.services;

import com.ram.pointage_app.entities.*;
import com.ram.pointage_app.repositories.*;
import lombok.*;
import org.springframework.stereotype.Service;



import java.util.List;
import java.sql.Date;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ShiftService {
    private final ShiftRepo shiftRepo;
    private final CollaboratorRepo collaboratorRepo;
    private final MachineRepo machineRepo;

    public List<Shift> getShifts() {
        return shiftRepo.findAll();
    }

    public Shift getShift(Long id) {
        return shiftRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
    }

    public Shift createShift(Shift shift) {
        Collaborator collaborator = null;
        if (shift.getCollaborator() != null) {
            if (shift.getCollaborator().getEmail() != null) {
                collaborator = collaboratorRepo.findByEmail(shift.getCollaborator().getEmail())
                        .orElseThrow(() -> new RuntimeException("Collaborator with email '" + shift.getCollaborator().getEmail() + "' not found"));
            }
        }
        if (collaborator == null) {
            throw new RuntimeException("Collaborator information is required");
        }
        shift.setCollaborator(collaborator);

        // Limite de 2 shifts par jour
        LocalDate today = LocalDate.now();
        int count = shiftRepo.countShiftsForCollaboratorOnDate(collaborator.getId(), Date.valueOf(today));
        if (count >= 2) {
            throw new RuntimeException("Vous avez déjà pointé deux fois aujourd'hui.");
        }

        // Vérification et chargement de la machine existante ou création si besoin
        if (shift.getMachine() != null) {
            Machine machine = null;
            if (shift.getMachine().getId() != null) {
                machine = machineRepo.findById(shift.getMachine().getId())
                        .orElseThrow(() -> new RuntimeException("Machine not found"));
            } else if (shift.getMachine().getMacAddress() != null) {
                machine = machineRepo.findByMacAddress(shift.getMachine().getMacAddress())
                        .orElseGet(() -> machineRepo.save(shift.getMachine()));
            } else if (shift.getMachine().getOrdName() != null) {
                machine = machineRepo.findByOrdName(shift.getMachine().getOrdName())
                        .orElseGet(() -> machineRepo.save(shift.getMachine()));
            }
            if (machine == null) {
                throw new RuntimeException("Machine information is required");
            }
            shift.setMachine(machine);
        } else {
            throw new RuntimeException("Machine information is required");
        }

        return shiftRepo.save(shift);
    }

    public String deleteShift(Long id) {
        if (shiftRepo.existsById(id)) {
            shiftRepo.deleteById(id);
            return "Shift deleted";
        }
        return "Shift not found";
    }

    public Shift updateShift(Long id, Shift updatedShift) {
        Shift shift = shiftRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Shift not found"));
        if (updatedShift.getDateSortie() != null) {
            shift.setDateSortie(updatedShift.getDateSortie());
        }
        if (updatedShift.getDuree() != 0) {
            shift.setDuree(updatedShift.getDuree());
        }
        return shiftRepo.save(shift);
    }
}