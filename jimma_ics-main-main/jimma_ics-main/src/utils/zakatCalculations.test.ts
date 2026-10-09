import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateZakatFigures, type ZakatCalculationInputs } from './zakatCalculations.ts';

const baseInput: ZakatCalculationInputs = {
  cashInHand: 0, bankDeposits: 0, digitalWallets: 0, foreignCurrencyETB: 0,
  goodDebtsReceivable: 0, gold24kGrams: 0, gold21kGrams: 0, gold18kGrams: 0,
  silverGrams: 0, otherPreciousMetals: 0, goldPricePerGram: 1000, silverPricePerGram: 10,
  stockInventoryValue: 0, rawMaterialsValue: 0, goodsInTransit: 0, tradeReceivables: 0,
  sharesLiquidValue: 0, retainedRentalIncome: 0, accessiblePension: 0,
  shortTermDebts: 0, immediateLivingExpenses: 0, overdueSupplierInvoices: 0, dueWagesAndTax: 0,
  nisabStandard: 'gold', calendarType: 'hijri', hasHawlPassed: true,
  harvestQuintals: 0, cropPricePerQuintal: 1000, irrigationType: 'rain',
  cattleCount: 0, sheepGoatCount: 0, usdRate: 100,
};

const calculate = (overrides: Partial<ZakatCalculationInputs> = {}) =>
  calculateZakatFigures({ ...baseInput, ...overrides });

describe('Zakat wealth and Nisab calculations', () => {
  it('calculates gold purity, cash, business, investments, and deductions into one net pool', () => {
    const result = calculate({
      cashInHand: 10000, bankDeposits: 20000, gold24kGrams: 1, gold21kGrams: 2,
      gold18kGrams: 2, silverGrams: 10, otherPreciousMetals: 1000,
      stockInventoryValue: 5000, rawMaterialsValue: 1000, goodsInTransit: 2000,
      tradeReceivables: 3000, sharesLiquidValue: 4000, retainedRentalIncome: 1000,
      accessiblePension: 2000, shortTermDebts: 5000, immediateLivingExpenses: 1000,
      overdueSupplierInvoices: 2000, dueWagesAndTax: 1000,
    });

    assert.equal(result.cashTotal, 30000);
    assert.equal(result.goldValue, 4250);
    assert.equal(result.silverValue, 100);
    assert.equal(result.totalGrossMonetaryAssets, 53350);
    assert.equal(result.totalDeductions, 9000);
    assert.equal(result.netZakatableWealth, 44350);
    assert.equal(result.zakatAlMalDue, 0);
  });

  it('uses the gold and silver thresholds and includes wealth exactly at Nisab', () => {
    assert.equal(calculate({ cashInHand: 84999 }).isNisabMet, false);
    const atGoldNisab = calculate({ cashInHand: 85000 });
    assert.equal(atGoldNisab.nisabThresholdETB, 85000);
    assert.equal(atGoldNisab.zakatAlMalDue, 2125);

    const atSilverNisab = calculate({
      cashInHand: 5950,
      nisabStandard: 'silver',
    });
    assert.equal(atSilverNisab.nisabThresholdETB, 5950);
    assert.equal(atSilverNisab.zakatAlMalDue, 149);
  });

  it('subtracts liabilities, floors net wealth at zero, and observes the Hawl switch', () => {
    assert.equal(calculate({ cashInHand: 1000, shortTermDebts: 2000 }).netZakatableWealth, 0);
    assert.equal(calculate({ cashInHand: 100000, hasHawlPassed: false }).zakatAlMalDue, 0);
    assert.equal(calculate({ cashInHand: 100000, calendarType: 'gregorian' }).zakatAlMalDue, 2577);
  });

  it('deducts eligible debts before Nisab and before calculating the payable amount', () => {
    const withDebt = calculate({
      cashInHand: 200000,
      shortTermDebts: 40000,
      overdueSupplierInvoices: 10000,
      dueWagesAndTax: 10000,
    });
    const withoutDebt = calculate({ cashInHand: 200000 });

    assert.equal(withDebt.totalDeductions, 60000);
    assert.equal(withDebt.netZakatableWealth, 140000);
    assert.equal(withDebt.zakatAlMalDue, 3500);
    assert.equal(withoutDebt.zakatAlMalDue, 5000);
    assert.equal(withDebt.grandTotalZakatETB, 3500);
  });

  it('does not charge monetary Zakat when deductions reduce wealth below Nisab', () => {
    const result = calculate({
      cashInHand: 100000,
      shortTermDebts: 20000,
    });

    assert.equal(result.netZakatableWealth, 80000);
    assert.equal(result.isNisabMet, false);
    assert.equal(result.zakatAlMalDue, 0);
  });

  it('ignores negative or non-finite numeric inputs and avoids a zero-price Nisab', () => {
    const malformed = calculate({
      cashInHand: -100,
      shortTermDebts: -500,
      goldPricePerGram: 0,
      silverPricePerGram: Number.NaN,
      harvestQuintals: Number.POSITIVE_INFINITY,
      usdRate: 0,
    });

    assert.equal(malformed.netZakatableWealth, 0);
    assert.equal(malformed.nisabThresholdETB, 0);
    assert.equal(malformed.isNisabMet, false);
    assert.equal(malformed.agricultureUshrDue, 0);
    assert.equal(malformed.grandTotalZakatUSD, 0);
  });
});

describe('Ushr and livestock calculations', () => {
  it('applies the crop Nisab threshold and irrigation rates', () => {
    assert.equal(calculate({ harvestQuintals: 6.52 }).agricultureUshrDue, 0);
    assert.equal(calculate({ harvestQuintals: 10, irrigationType: 'rain' }).agricultureUshrDue, 1000);
    assert.equal(calculate({ harvestQuintals: 10, irrigationType: 'irrigated' }).agricultureUshrDue, 500);
    assert.equal(calculate({ harvestQuintals: 10, irrigationType: 'mixed' }).agricultureUshrDue, 750);
  });

  it('checks the implemented livestock quantity bands and totals them with other obligations', () => {
    assert.equal(calculate({ cattleCount: 29, sheepGoatCount: 39 }).livestockSummary.totalLivestockCash, 0);
    assert.equal(calculate({ cattleCount: 30 }).livestockSummary.totalLivestockCash, 26000);
    assert.equal(calculate({ cattleCount: 40 }).livestockSummary.totalLivestockCash, 38000);
    assert.equal(calculate({ sheepGoatCount: 40 }).livestockSummary.totalLivestockCash, 6500);
    assert.equal(calculate({ sheepGoatCount: 121 }).livestockSummary.totalLivestockCash, 13000);
    assert.equal(calculate({ sheepGoatCount: 201 }).livestockSummary.totalLivestockCash, 19500);
    assert.equal(calculate({ sheepGoatCount: 400 }).livestockSummary.totalLivestockCash, 26000);

    const combined = calculate({ cashInHand: 100000, harvestQuintals: 10, cattleCount: 30 });
    assert.equal(combined.grandTotalZakatETB, 29500);
    assert.equal(combined.grandTotalZakatUSD, 295);
  });
});
