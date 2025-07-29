package com.ram.pointage_app.repositories;

import com.ram.pointage_app.entities.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MachineRepo extends JpaRepository<Machine, Long> {
    java.util.Optional<Machine> findByOrdName(String ordName);
    java.util.Optional<Machine> findByMacAddress(String macAddress);
}
