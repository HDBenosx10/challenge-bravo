import { CreateCurrencyDTO } from '../dto/create-currency.dto';
import { Currency } from '../entities/currency.entity';
import { CurrencyRepository } from '../repositories/currency.repository';
import { ExternalCurrencyAPI } from './external-currency-api.service';

export class CurrencyService {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly externalCurrencyAPI: ExternalCurrencyAPI
  ) {}
  
  async createCurrency(createCurrencyDTO: CreateCurrencyDTO): Promise<Currency> {
    const currency = new Currency(
      createCurrencyDTO.code,
      createCurrencyDTO.unitCost,
      createCurrencyDTO.backingCurrency
    );
    await this.currencyRepository.create(currency);
    return currency;
  }

  async findCurrency(code: string): Promise<Currency> {
    return this.currencyRepository.findByCurrencyCode(code);
  }
  
  async convertCurrency(fromCode: string, toCode: string, amount: string) {
    const fromCurrency = await this.currencyRepository.findByCurrencyCode(fromCode);
    const toCurrency = await this.currencyRepository.findByCurrencyCode(toCode);
    if(!fromCurrency && !toCurrency) {
      return this.externalCurrencyAPI.convert(fromCode, toCode);
    }
    if(!fromCurrency){
      const fromValue = await this.externalCurrencyAPI.convert(fromCode, process.env.DEFAULT_BACKING_CURRENCY || 'USD');
      new Currency(fromCode, fromValue).convert(toCurrency, amount);
    } 
    if(!toCurrency) {
      const toValue = await this.externalCurrencyAPI.convert(toCode, process.env.DEFAULT_BACKING_CURRENCY || 'USD');
      new Currency(fromCode, toValue).convert(fromCurrency, amount);
    }
    return fromCurrency.convert(toCurrency, amount);

  }
}

