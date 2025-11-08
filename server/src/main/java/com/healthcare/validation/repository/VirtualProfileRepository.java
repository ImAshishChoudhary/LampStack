package com.healthcare.validation.repository;

import com.healthcare.validation.domain.Provider;
import com.healthcare.validation.domain.VirtualProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VirtualProfileRepository extends JpaRepository<VirtualProfile, Long> {
    
    List<VirtualProfile> findByProviderOrderByVersionDesc(Provider provider);
    
    @Query("SELECT MAX(v.version) FROM VirtualProfile v WHERE v.provider = :provider")
    Optional<Integer> findMaxVersionByProvider(Provider provider);
    
    Optional<VirtualProfile> findByProviderAndVersion(Provider provider, Integer version);
}
