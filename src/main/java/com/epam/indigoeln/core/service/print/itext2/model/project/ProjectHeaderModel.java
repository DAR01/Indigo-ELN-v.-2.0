package com.epam.indigoeln.core.service.print.itext2.model.project;

import com.epam.indigoeln.core.service.print.itext2.model.common.BaseHeaderModel;
import com.epam.indigoeln.core.service.print.itext2.model.common.image.PdfImage;

import java.time.Instant;
import java.time.ZonedDateTime;

/**
 * Extension BaseHeaderModel for project header
 */
public class ProjectHeaderModel extends BaseHeaderModel{
    private String author;
    private ZonedDateTime creationDate;
    private String projectName;
    private Instant printDate;

    public ProjectHeaderModel(PdfImage logo, String author, ZonedDateTime creationDate,
                              String projectName, Instant printDate) {
        super(logo);
        this.author = author;
        this.creationDate = creationDate;
        this.projectName = projectName;
        this.printDate = printDate;
    }

    public String getAuthor() {
        return author;
    }

    public ZonedDateTime getCreationDate() {
        return creationDate;
    }

    public String getProjectName() {
        return projectName;
    }

    public Instant getPrintDate() {
        return printDate;
    }
}
