package com.epam.indigoeln.core.repository.search.entity;

import com.epam.indigoeln.core.model.*;
import com.epam.indigoeln.core.repository.search.component.SearchComponentsRepository;
import com.epam.indigoeln.web.rest.dto.search.EntitySearchResultDTO;
import com.epam.indigoeln.web.rest.dto.search.request.EntitySearchRequest;
import com.epam.indigoeln.web.rest.util.PermissionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class EntitySearchRepository implements ApplicationContextAware {

    private static final Logger LOGGER = LoggerFactory.getLogger(SearchComponentsRepository.class);

    private static final String KIND_PROJECT = "Project";
    private static final String KIND_NOTEBOOK = "Notebook";
    private static final String KIND_EXPERIMENT = "Experiment";

    @Autowired
    private MongoTemplate mongoTemplate;

    private ApplicationContext context;


    public List<EntitySearchResultDTO> findEntities(User user, EntitySearchRequest searchRequest, List<Integer> bingoIds) {

        Optional<Aggregation> aggregation = buildProjectAggregation(searchRequest, bingoIds);
        final Optional<List<EntitySearchResultDTO>> projectResult = aggregation.map(agg -> {
            LOGGER.debug("Perform project search query: " + agg.toString());
            List<Project> mappedResults = mongoTemplate.aggregate(agg, Project.class, Project.class).getMappedResults();

            return mappedResults.stream().filter(
                    p -> PermissionUtil.hasPermissions(user.getId(), p.getAccessList(), UserPermission.READ_ENTITY)
            ).map(this::convert).collect(Collectors.toList());
        });

        aggregation = buildNotebookAggregation(searchRequest, bingoIds);
        final Optional<List<EntitySearchResultDTO>> notebookResult = aggregation.map(agg -> {
            LOGGER.debug("Perform notebook search query: " + agg.toString());
            List<Notebook> mappedResults = mongoTemplate.aggregate(agg, Notebook.class, Notebook.class).getMappedResults();

            return mappedResults.stream().filter(
                    n -> PermissionUtil.hasPermissions(user.getId(), n.getAccessList(), UserPermission.READ_ENTITY)
            ).map(this::convert).collect(Collectors.toList());
        });

        aggregation = buildExperimentAggregation(searchRequest, bingoIds);
        final Optional<List<EntitySearchResultDTO>> experimentResult = aggregation.map(agg -> {
            LOGGER.debug("Perform experiment search query: " + agg.toString());
            List<Experiment> mappedResults = mongoTemplate.aggregate(agg, Experiment.class, Experiment.class).getMappedResults();

            return mappedResults.stream().filter(
                    p -> PermissionUtil.hasPermissions(user.getId(), p.getAccessList(), UserPermission.READ_ENTITY)
            ).map(this::convert).collect(Collectors.toList());
        });
        return merge(projectResult, notebookResult, experimentResult);

    }

    private List<EntitySearchResultDTO> merge(Optional<List<EntitySearchResultDTO>> projectResult, Optional<List<EntitySearchResultDTO>> notebookResult,
                                              Optional<List<EntitySearchResultDTO>> experimentResult) {
        List<EntitySearchResultDTO> result = new ArrayList<>();
        projectResult.ifPresent(result::addAll);
        notebookResult.ifPresent(result::addAll);
        experimentResult.ifPresent(result::addAll);
        return result;
    }

    private Optional<Aggregation> buildProjectAggregation(EntitySearchRequest request, List<Integer> bingoIds) {
        ProjectSearchAggregationBuilder builder = ProjectSearchAggregationBuilder.getInstance();
        if (!bingoIds.isEmpty()) {
            final StructureSearchType type = request.getStructure().get().getType().getName();
            builder.withBingoIds(type, bingoIds);
        } else if (request.getSearchQuery().isPresent()) {
            builder.withSearchQuery(request.getSearchQuery().get());
        } else {
            builder.withAdvancedCriteria(request.getAdvancedSearch());
        }

        return builder.build();
    }

    private EntitySearchResultDTO convert(Project project) {
        EntitySearchResultDTO result = new EntitySearchResultDTO();
        result.setKind(KIND_PROJECT);
        result.setName(project.getName());
        result.setCreationDate(project.getCreationDate());
        return result;
    }

    private Optional<Aggregation> buildNotebookAggregation(EntitySearchRequest request, List<Integer> bingoIds) {
        NotebookSearchAggregationBuilder builder = NotebookSearchAggregationBuilder.getInstance();
        if (!bingoIds.isEmpty()) {
            final StructureSearchType type = request.getStructure().get().getType().getName();
            builder.withBingoIds(type, bingoIds);
        } else if (request.getSearchQuery().isPresent()) {
            builder.withSearchQuery(request.getSearchQuery().get());
        } else {
            builder.withAdvancedCriteria(request.getAdvancedSearch());
        }

        return builder.build();
    }

    private EntitySearchResultDTO convert(Notebook notebook) {
        EntitySearchResultDTO result = new EntitySearchResultDTO();
        result.setKind(KIND_NOTEBOOK);
        result.setName(notebook.getName());
        result.setCreationDate(notebook.getCreationDate());
        return result;
    }

    private Optional<Aggregation> buildExperimentAggregation(EntitySearchRequest request, List<Integer> bingoIds) {
        ExperimentSearchAggregationBuilder builder = ExperimentSearchAggregationBuilder.getInstance(context, mongoTemplate);
        if (!bingoIds.isEmpty()) {
            final StructureSearchType type = request.getStructure().get().getType().getName();
            builder.withBingoIds(type, bingoIds);
        } else if (request.getSearchQuery().isPresent()) {
            builder.withQuerySearch(request.getSearchQuery().get());
        } else {
            builder.withAdvancedCriteria(request.getAdvancedSearch());
        }

        return builder.build();
    }

    private EntitySearchResultDTO convert(Experiment experiment) {
        EntitySearchResultDTO result = new EntitySearchResultDTO();
        result.setKind(KIND_EXPERIMENT);
        result.setName(experiment.getName());
        result.setCreationDate(experiment.getCreationDate());
        return result;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.context = applicationContext;
    }
}
