package com.epam.indigoeln.core.service.search;

import com.epam.indigoeln.web.rest.dto.search.ProductBatchDetailsDTO;
import com.epam.indigoeln.web.rest.dto.search.request.BatchSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Provides methods for search.
 */
@Service
public class SearchServiceFacade {

    @Autowired
    private List<SearchServiceAPI> catalogues;

    public Collection<SearchServiceAPI.Info> getCatalogues() {
        return catalogues.stream().map(SearchServiceAPI::getInfo).collect(Collectors.toList());
    }

    /**
     * Returns list with product batch details transfer objects.
     *
     * @param searchRequest Search request
     * @return List with product batch details transfer objects
     */
    public Collection<ProductBatchDetailsDTO> findBatches(BatchSearchRequest searchRequest) {
        Collection<ProductBatchDetailsDTO> result = new ArrayList<>();
        for (SearchServiceAPI provider : getSearchProviders(searchRequest.getDatabases())) {
            Collection<ProductBatchDetailsDTO> batches = provider.findBatches(searchRequest);
            result.addAll(batches);
            Optional<Integer> batchesLeft = searchRequest.getBatchesLimit();
            if (batchesLeft.isPresent()) {
                if (batches.size() == batchesLeft.get()) {
                    break;
                } else {
                    searchRequest.setBatchesLimit(batchesLeft.get() - batches.size());
                }
            }
        }
        return result;
    }

    private Collection<SearchServiceAPI> getSearchProviders(List<String> dataSourceNames) {
        return catalogues.stream().filter(p -> dataSourceNames.contains(p.getInfo().getValue()))
                .collect(Collectors.toList());
    }
}