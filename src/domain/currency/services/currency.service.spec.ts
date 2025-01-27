import { Currency } from '../entities/currency.entity';
import { CurrencyService } from './currency.service';

const mockCurrencyDatabase = [
  {
    id: '123',
    code: 'HURB',
    backingCurrency: 'USD',
    unitCost: '2'
  },
  {
    id: '321',
    code: 'BENIN',
    backingCurrency: 'USD',
    unitCost: '1'
  }
];

const MockRepository = () => ({
  findByCurrencyCode: jest
    .fn()
    .mockImplementation((code: string)=> {
      const result = mockCurrencyDatabase.find((currency)=> currency.code === code);
      if(!result) return Promise.resolve(null);
      return Promise.resolve(new Currency(result.code,result.unitCost,result.backingCurrency,result.id));
    }),
  create: jest
    .fn()
    .mockImplementation((currency: Currency) => Promise.resolve(currency)),
  deleteByCurrencyCode: jest.fn()
});

const MockAPI = () => ({
  convert: jest.fn().mockImplementation(()=> Promise.resolve('1'))
});

const MockCacheManager = () => ({
  getCache:jest.fn(),
  setCache:jest.fn()
});

describe('Currency service unit tests', () => {
  const currencyService = new CurrencyService(MockRepository(), MockAPI(), MockCacheManager());
  it('should create currency', async () => {
    const input = {
      code: 'HURB2',
      unitCost: '100'
    };

    const currency = await currencyService.createCurrency(input);

    expect(currency.backingCurrency).toBe('USD');
    expect(currency.unitCost).toBe(input.unitCost);
    expect(currency.code).toBe(input.code);
  });

  it('should throw Currency already exists', async () => {
    const input = {
      code: 'HURB',
      unitCost: '100'
    };

    const currency = currencyService.createCurrency(input);

    expect(currency).rejects.toThrow('Currency already exists');
  });


  it('should convert customs currencies', async () => {
    const result = await currencyService.convertCurrency('BENIN','HURB','10');
    expect(result).toBe('5');
  });

  it('should convert real currencies', async () => {
    const result = await currencyService.convertCurrency('USD','BRL','10.5');
    expect(result).toBe('10.5');
  });
});
