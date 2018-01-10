package com.epam.indigoeln.core.service.print.itext2.model.notebook;

import com.epam.indigoeln.core.service.print.itext2.model.common.SectionModel;

/**
 * Implementation of SectionModel interface for notebook summary.
 */
public class NotebookSummaryModel implements SectionModel {
    private String description;

    public NotebookSummaryModel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
