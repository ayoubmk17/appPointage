package com.ram.pointage_app.repositories;

import com.ram.pointage_app.entities.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepo extends JpaRepository<Shift, Long> {
    @Query(value = "SELECT COUNT(*) FROM shift s WHERE s.collaborator_id = :collabId AND DATE(s.date_entree) = :date", nativeQuery = true)
    int countShiftsForCollaboratorOnDate(@Param("collabId") Long collabId, @Param("date") java.sql.Date date);
}
