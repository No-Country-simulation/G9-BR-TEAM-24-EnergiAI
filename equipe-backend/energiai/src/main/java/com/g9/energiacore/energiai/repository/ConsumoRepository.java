package com.g9.energiacore.energiai.repository;

import com.g9.energiacore.energiai.domain.Consumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsumoRepository extends JpaRepository<Consumo, Long> {
    List<Consumo> findByUsuarioIdOrderByReferenceMonthDesc(Long usuarioId);
    Optional<Consumo> findByIdAndUsuarioId(Long id, Long usuarioId);
    boolean existsByUsuarioIdAndReferenceMonth(Long usuarioId, LocalDate referenceMonth);
    Optional<Consumo> findByUsuarioIdAndReferenceMonth(Long usuarioId, LocalDate referenceMonth);
}
