package com.epam.indigoeln.core.service.print.itext2.model.experiment;

import com.epam.indigoeln.core.service.print.itext2.model.common.SectionModel;

import java.util.List;

/**
 * Implementation of SectionModel interface for registration summary.
 */
public class RegistrationSummaryModel implements SectionModel {
    private List<RegistrationSummaryRow> rows;

    public RegistrationSummaryModel(List<RegistrationSummaryRow> rows) {
        this.rows = rows;
    }

    public List<RegistrationSummaryRow> getRows() {
        return rows;
    }

    /**
     * Inner class which describes summary row.
     */
    public static class RegistrationSummaryRow {
        private String fullNbkBatch;
        private String totalAmountMade;
        private String totalAmountMadeUnit;
        private String registrationStatus;
        private String conversationalBatch;


        public RegistrationSummaryRow(String fullNbkBatch, String totalAmountMade,
                                      String totalAmountMadeUnit, String registrationStatus,
                                      String conversationalBatch) {
            this.fullNbkBatch = fullNbkBatch;
            this.totalAmountMade = totalAmountMade;
            this.totalAmountMadeUnit = totalAmountMadeUnit;
            this.registrationStatus = registrationStatus;
            this.conversationalBatch = conversationalBatch;
        }

        public String getFullNbkBatch() {
            return fullNbkBatch;
        }

        public String getTotalAmountMade() {
            return totalAmountMade;
        }

        public String getRegistrationStatus() {
            return registrationStatus;
        }

        public String getConversationalBatch() {
            return conversationalBatch;
        }

        public String getTotalAmountMadeUnit() {
            return totalAmountMadeUnit;
        }
    }
}