package com.epam.indigoeln.core.chemistry;

import com.epam.indigoeln.core.chemistry.domain.AmountModel;
import com.epam.indigoeln.core.chemistry.domain.BatchModel;
import com.epam.indigoeln.core.chemistry.domain.MonomerBatchModel;
import com.epam.indigoeln.core.chemistry.domain.ProductBatchModel;
import com.epam.indigoeln.core.chemistry.experiment.common.units.Unit2;
import com.epam.indigoeln.web.rest.dto.calculation.BasicBatchModel;

import java.util.ArrayList;
import java.util.function.Consumer;

import static com.epam.indigoeln.core.chemistry.experiment.common.units.UnitType.*;

public class ProductCalculator {

    private static final int WEIGHT_AMOUNT = 1;
    private static final int VOLUME_AMOUNT = 2;
    private static final int MOLES_AMOUNT = 3;

    private static void setTotalAmountMadeWeight(ProductBatchModel batch, AmountModel amount, boolean isQuitly) {
        batch.setTotalWeightAmountQuitly(new AmountModel(MASS, 0));
        batch.setTotalWeightAmount(amount);
        batch.recalcAmounts();
        if (!isQuitly) {
            batch.getTotalWeight().setCalculated(false);
        }
        //Sync all units
        ArrayList objectList = new ArrayList();
        objectList.add(batch);
        syncUnitsAndSigDigits(objectList, amount, WEIGHT_AMOUNT);
    }

    private static void setTotalAmountMadeVolume(ProductBatchModel batch, AmountModel amount) {
        batch.setTotalVolumeAmountQuitly(new AmountModel(VOLUME, 0));
        batch.setTotalVolumeAmount(amount);
        batch.getTotalVolume().setCalculated(false);
        batch.recalcAmounts();
        //Sync all units
        ArrayList objectList = new ArrayList();
        objectList.add(batch);
        syncUnitsAndSigDigits(objectList, amount, VOLUME_AMOUNT);
    }

    private static void setTotalMoles(ProductBatchModel batch, AmountModel totalMolesAmountModel) {
        double totalWeightInStdUnits = totalMolesAmountModel.getValueInStdUnitsAsDouble() * batch.getMolWgt();
        AmountModel newTotalWeightAmountModel = new AmountModel(MASS, totalWeightInStdUnits);
        newTotalWeightAmountModel.setUnit(batch.getTotalWeight().getUnit()); //Do not change unit based on moles. Total wt unit takes precedence.
        newTotalWeightAmountModel.setSigDigits(batch.getTotalWeight().getSigDigits());
        setTotalAmountMadeWeight(batch, newTotalWeightAmountModel, true);
        batch.getTheoreticalMoleAmount().setUnit(totalMolesAmountModel.getUnit());
        batch.getMoleAmount().setCalculated(false);
    }

    private static void syncUnitsAndSigDigits(ArrayList objectList, AmountModel amount, int property) {
        Unit2 unit = amount.getUnit();
        int sigDigits = amount.getSigDigits();

        Consumer<Object> weightAmount = (object) -> {
            if (object instanceof ProductBatchModel) {
                ProductBatchModel productBatchModel = (ProductBatchModel) object;
                productBatchModel.getTotalWeight().setUnit(unit);
                productBatchModel.getTotalWeight().setSigDigits(sigDigits);
                productBatchModel.getTheoreticalWeightAmount().setUnit(unit);
                productBatchModel.getTheoreticalWeightAmount().setSigDigits(sigDigits);
            } else if (object instanceof MonomerBatchModel) {
                MonomerBatchModel monomerBatchModel = (MonomerBatchModel) object;
                monomerBatchModel.getStoicWeightAmount().setUnit(unit);
                monomerBatchModel.getStoicWeightAmount().setSigDigits(sigDigits);
            }
        };

        Consumer<Object> volumeAmount = (object) -> {
            if (object instanceof ProductBatchModel) {
                ProductBatchModel productBatchModel = (ProductBatchModel) object;
                productBatchModel.getTotalVolume().setUnit(unit);
                productBatchModel.getTotalVolume().setSigDigits(sigDigits);
            }
        };

        Consumer<Object> molesAmount = (object) -> {
            if (object instanceof MonomerBatchModel) {
                MonomerBatchModel monomerBatchModel = (MonomerBatchModel) object;
                monomerBatchModel.getStoicMoleAmount().setUnit(unit);
                monomerBatchModel.getStoicMoleAmount().setSigDigits(sigDigits);
            }
        };

        for (Object object : objectList) {
            if (object == null)
                continue;

            switch (property) {
                case WEIGHT_AMOUNT:
                    weightAmount.accept(object);
                    break;

                case VOLUME_AMOUNT:
                    volumeAmount.accept(object);
                    break;

                case MOLES_AMOUNT:
                    molesAmount.accept(object);
                    break;

                default:
                    break;
            }
        }
    }

    public void calculateProductBatch(ProductBatchModel batch, BasicBatchModel rawBatch, String changedField) {
        AmountModel amount;
        switch (changedField) {
            case "totalWeight":
                amount = new AmountModel(MASS, rawBatch.getTotalWeight().getValue(), !rawBatch.getTotalWeight().isEntered());
                setTotalAmountMadeWeight(batch, amount, false);
                break;
            case "totalVolume":
                amount = new AmountModel(VOLUME, rawBatch.getTotalVolume().getValue(), !rawBatch.getTotalVolume().isEntered());
                setTotalAmountMadeVolume(batch, amount);
                break;
            case "mol":
                amount = new AmountModel(MOLES, rawBatch.getMol().getValue(), !rawBatch.getMol().isEntered());
                setTotalMoles(batch, amount);
                break;
            default:
                batch.recalcAmounts();
                break;
        }

    }

}
