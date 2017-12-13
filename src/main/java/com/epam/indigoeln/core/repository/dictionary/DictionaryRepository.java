package com.epam.indigoeln.core.repository.dictionary;

import com.epam.indigoeln.core.model.Dictionary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DictionaryRepository extends MongoRepository<Dictionary, String> {

    Dictionary findByName(String name);

    Page<Dictionary> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String nameLike, String descriptionLike, Pageable pageable);

}
