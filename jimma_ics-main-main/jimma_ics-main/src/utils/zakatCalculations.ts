export type IrrigationType = 'rain' | 'irrigated' | 'mixed';
export type NisabStandard = 'gold' | 'silver';
export type CalendarType = 'hijri' | 'gregorian';

export interface ZakatCalculationInputs {
  cashInHand: number;
  bankDeposits: number;
  digitalWallets: number;
  foreignCurrencyETB: number;
  goodDebtsReceivable: number;
  gold24kGrams: number;
  gold21kGrams: number;
  gold18kGrams: number;
  silverGrams: number;
  otherPreciousMetals: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
  stockInventoryValue: number;
  rawMaterialsValue: number;
  goodsInTransit: number;
  tradeReceivables: number;
  sharesLiquidValue: number;
  retainedRentalIncome: number;
  accessiblePension: number;
  shortTermDebts: number;
  immediateLivingExpenses: number;
  overdueSupplierInvoices: number;
  dueWagesAndTax: number;
  nisabStandard: NisabStandard;
  calendarType: CalendarType;
  hasHawlPassed: boolean;
  harvestQuintals: number;
  cropPricePerQuintal: number;
  irrigationType: IrrigationType;
  cattleCount: number;
  sheepGoatCount: number;
  usdRate: number;
}

export function calculateZakatFigures(input: ZakatCalculationInputs) {
  const values = Object.fromEntries(Object.entries(input).map(([key, value]) => [
    key,
    typeof value === 'number' ? (Number.isFinite(value) ? Math.max(0, value) : 0) : value,
  ])) as unknown as ZakatCalculationInputs;

  const cashTotal = values.cashInHand + values.bankDeposits + values.digitalWallets
    + values.foreignCurrencyETB + values.goodDebtsReceivable;
  const goldValue = values.gold24kGrams * values.goldPricePerGram
    + values.gold21kGrams * values.goldPricePerGram * (21 / 24)
    + values.gold18kGrams * values.goldPricePerGram * (18 / 24);
  const silverValue = values.silverGrams * values.silverPricePerGram;
  const metalsTotal = goldValue + silverValue + values.otherPreciousMetals;
  const businessTotal = values.stockInventoryValue + values.rawMaterialsValue
    + values.goodsInTransit + values.tradeReceivables;
  const investmentsTotal = values.sharesLiquidValue + values.retainedRentalIncome + values.accessiblePension;
  const totalGrossMonetaryAssets = cashTotal + metalsTotal + businessTotal + investmentsTotal;
  const totalDeductions = values.shortTermDebts + values.immediateLivingExpenses
    + values.overdueSupplierInvoices + values.dueWagesAndTax;
  const netZakatableWealth = Math.max(0, totalGrossMonetaryAssets - totalDeductions);
  const nisabThresholdETB = values.nisabStandard === 'gold'
    ? 85 * values.goldPricePerGram
    : 595 * values.silverPricePerGram;
  const isNisabMet = nisabThresholdETB > 0 && netZakatableWealth >= nisabThresholdETB;
  const zakatRate = values.calendarType === 'hijri' ? 0.025 : 0.02577;
  const zakatAlMalDue = isNisabMet && values.hasHawlPassed
    ? Math.round(netZakatableWealth * zakatRate)
    : 0;

  const cropNisabQuintals = 6.53;
  const isCropNisabMet = values.harvestQuintals >= cropNisabQuintals;
  const totalCropMarketValue = values.harvestQuintals * values.cropPricePerQuintal;
  const ushrRate = values.irrigationType === 'rain' ? 0.1
    : values.irrigationType === 'irrigated' ? 0.05 : 0.075;
  const agricultureUshrDue = isCropNisabMet ? Math.round(totalCropMarketValue * ushrRate) : 0;

  let cattleObligation = 'Exempt (Below 30 head)';
  let cattleCashValue = 0;
  if (values.cattleCount >= 40) {
    const musinnahCount = Math.floor(values.cattleCount / 40);
    cattleObligation = `${musinnahCount} Musinnah (2-year-old cow/heifer)`;
    cattleCashValue = musinnahCount * 38000;
  } else if (values.cattleCount >= 30) {
    cattleObligation = '1 Tabee’ (1-year-old male/female calf)';
    cattleCashValue = 26000;
  }

  let sheepObligation = 'Exempt (Below 40 head)';
  let sheepCashValue = 0;
  if (values.sheepGoatCount >= 400) {
    const sheepNum = Math.floor(values.sheepGoatCount / 100);
    sheepObligation = `${sheepNum} Sheep / Ewes`;
    sheepCashValue = sheepNum * 6500;
  } else if (values.sheepGoatCount >= 201) {
    sheepObligation = '3 Sheep / Ewes';
    sheepCashValue = 3 * 6500;
  } else if (values.sheepGoatCount >= 121) {
    sheepObligation = '2 Sheep / Ewes';
    sheepCashValue = 2 * 6500;
  } else if (values.sheepGoatCount >= 40) {
    sheepObligation = '1 Sheep / Ewe';
    sheepCashValue = 6500;
  }

  const livestockSummary = {
    cattleObligation,
    sheepObligation,
    totalLivestockCash: cattleCashValue + sheepCashValue,
  };
  const grandTotalZakatETB = zakatAlMalDue + agricultureUshrDue + livestockSummary.totalLivestockCash;

  return {
    cashTotal,
    goldValue,
    silverValue,
    metalsTotal,
    businessTotal,
    investmentsTotal,
    totalGrossMonetaryAssets,
    totalDeductions,
    netZakatableWealth,
    nisabThresholdETB,
    isNisabMet,
    zakatAlMalDue,
    cropNisabQuintals,
    isCropNisabMet,
    totalCropMarketValue,
    ushrRate,
    agricultureUshrDue,
    livestockSummary,
    grandTotalZakatETB,
    grandTotalZakatUSD: values.usdRate > 0 ? Math.round(grandTotalZakatETB / values.usdRate) : 0,
    nisabPercentage: Math.min(100, Math.round((netZakatableWealth / (nisabThresholdETB || 1)) * 100)),
  };
}
