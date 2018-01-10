package com.epam.indigoeln.core.chemistry.experiment.utils;

import com.epam.indigoeln.core.chemistry.domain.AmountModel;

import static com.epam.indigoeln.core.util.EqualsUtil.doubleEqZero;

public final class BatchUtils {

    private BatchUtils() {
        // Hide the default constructor
    }

    public static boolean isUnitOnlyChanged(AmountModel from, AmountModel to) {
        boolean result;
        result = (CeNNumberUtils.doubleEquals(from.getValueInStdUnitsAsDouble(),
                to.getValueInStdUnitsAsDouble()) && !(from
                .getUnit().equals(to.getUnit())));

        return result;
    }

    public static double calcMolesWithEquivalents(AmountModel reagentMoles, AmountModel equiv) {
        if (doubleEqZero(reagentMoles.getValueInStdUnitsAsDouble())) {
            return reagentMoles.getValueInStdUnitsAsDouble();
        }
        return reagentMoles.getValueInStdUnitsAsDouble() * equiv.getValueInStdUnitsAsDouble();

    }

    public static double calcEquivalentsWithMoles(AmountModel moles, AmountModel reagentMoles) {
        if (doubleEqZero(reagentMoles.getValueInStdUnitsAsDouble())) {
            return moles.getValueInStdUnitsAsDouble();
        }
        return moles.getValueInStdUnitsAsDouble() / reagentMoles.getValueInStdUnitsAsDouble();
    }
}
