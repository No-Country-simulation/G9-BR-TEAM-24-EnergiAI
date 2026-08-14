package com.g9.energiacore.energiai.domain;

import com.g9.energiacore.energiai.dto.Regiao;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "consumos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consumo_kwh", nullable = false, columnDefinition = "NUMERIC(10,2)")
    private Double consumoKwh;

    @Column(name = "uso_horario_pico", nullable = false)
    private Boolean usoHorarioPico;

    @Column(name = "quantidade_equipamentos", nullable = false)
    private Integer quantidadeEquipamentos;

    @Column(name = "tipo_imovel", nullable = false, length = 100)
    private String tipoImovel;

    @Column(name = "horas_alto_consumo", nullable = false)
    private Integer horasAltoConsumo;

    @Column(name = "quantidade_ar_condicionado", nullable = false)
    private Integer quantidadeArCondicionado;

    @Column(name = "moradores", nullable = false)
    private Integer moradores;

    @Enumerated(EnumType.STRING)
    @Column(name = "regiao", nullable = false, length = 50)
    private Regiao regiao;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "reference_month")
    private LocalDate referenceMonth;

    @Column(name = "categoria_ia", length = 50)
    private String categoriaIa;

    @Column(name = "probabilidade_ia", columnDefinition = "NUMERIC(5,4)")
    private Double probabilidadeIa;

    @Column(name = "custo_estimado_mensal", columnDefinition = "NUMERIC(10,2)")
    private Double custoEstimadoMensal;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
        if (this.referenceMonth == null) {
            this.referenceMonth = LocalDate.now().withDayOfMonth(1);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Consumo consumo = (Consumo) o;
        return id != null && Objects.equals(id, consumo.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
