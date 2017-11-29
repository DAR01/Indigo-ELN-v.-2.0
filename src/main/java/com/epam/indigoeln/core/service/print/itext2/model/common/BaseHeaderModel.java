package com.epam.indigoeln.core.service.print.itext2.model.common;

import com.epam.indigoeln.core.service.print.itext2.model.common.image.PdfImage;

/**
 * Abstract representation for base header.
 */
public abstract class BaseHeaderModel implements SectionModel {
    private static final int DEFAULT_PAGE = -1;

    private int currentPage = DEFAULT_PAGE;
    private int totalPages = DEFAULT_PAGE;
    private PdfImage logo;

    public BaseHeaderModel(PdfImage logo) {
        this.logo = logo;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public PdfImage getLogo() {
        return logo;
    }
}