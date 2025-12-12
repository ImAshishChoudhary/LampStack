import axios from 'axios';

interface NPIRegistryResponse {
  result_count: number;
  results: NPIResult[];
}

interface NPIResult {
  number: string;
  basic: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
    name?: string;
    organizational_subpart?: string;
  };
  addresses: Array<{
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
    telephone_number: string;
    address_purpose: string;
  }>;
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }>;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  discrepancies: string[];
  npiData: any;
  matchedFields: {
    name: boolean;
    address: boolean;
    phone: boolean;
    specialty: boolean;
    license: boolean;
  };
}

export class NPIRegistryService {
  private readonly BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';
  private readonly TIMEOUT = 10000;

  async validateNPI(npiNumber: string): Promise<ValidationResult> {
    try {
      const response = await axios.get<NPIRegistryResponse>(this.BASE_URL, {
        params: {
          number: npiNumber,
          version: '2.1',
        },
        timeout: this.TIMEOUT,
      });

      if (response.data.result_count === 0) {
        return {
          isValid: false,
          confidence: 0,
          discrepancies: ['NPI number not found in registry'],
          npiData: null,
          matchedFields: {
            name: false,
            address: false,
            phone: false,
            specialty: false,
            license: false,
          },
        };
      }

      const npiResult = response.data.results[0];
      
      return {
        isValid: true,
        confidence: 1.0,
        discrepancies: [],
        npiData: this.formatNPIData(npiResult),
        matchedFields: {
          name: true,
          address: true,
          phone: true,
          specialty: true,
          license: true,
        },
      };
    } catch (error: any) {
      console.error('NPI Registry API error:', error.message);
      throw new Error(`Failed to validate NPI: ${error.message}`);
    }
  }

  async compareProviderData(provider: {
    npiNumber: string;
    firstName: string;
    lastName: string;
    primaryPhone?: string;
    practiceAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    specialties?: string[];
  }): Promise<ValidationResult> {
    try {
      const response = await axios.get<NPIRegistryResponse>(this.BASE_URL, {
        params: {
          number: provider.npiNumber,
          version: '2.1',
        },
        timeout: this.TIMEOUT,
      });

      if (response.data.result_count === 0 || !response.data.results || response.data.results.length === 0) {
        return {
          isValid: false,
          confidence: 0,
          discrepancies: ['NPI number not found in registry'],
          npiData: null,
          matchedFields: {
            name: false,
            address: false,
            phone: false,
            specialty: false,
            license: false,
          },
        };
      }

      const npiResult = response.data.results[0];
      return this.analyzeDiscrepancies(provider, npiResult);
    } catch (error: any) {
      console.error('NPI comparison error:', error.message);
      return {
        isValid: false,
        confidence: 0,
        discrepancies: [`NPI Registry API error: ${error.message}`],
        npiData: null,
        matchedFields: {
          name: false,
          address: false,
          phone: false,
          specialty: false,
          license: false,
        },
      };
    }
  }

  private analyzeDiscrepancies(
    provider: any,
    npiResult: NPIResult
  ): ValidationResult {
    const discrepancies: string[] = [];
    const matchedFields = {
      name: false,
      address: false,
      phone: false,
      specialty: false,
      license: false,
    };

    const npiFirstName = npiResult.basic.first_name?.toLowerCase() || '';
    const npiLastName = npiResult.basic.last_name?.toLowerCase() || '';
    const providerFirstName = provider.firstName?.toLowerCase() || '';
    const providerLastName = provider.lastName?.toLowerCase() || '';

    if (npiFirstName === providerFirstName && npiLastName === providerLastName) {
      matchedFields.name = true;
    } else {
      discrepancies.push(
        `Name mismatch: Provider has "${provider.firstName} ${provider.lastName}", NPI Registry has "${npiResult.basic.first_name} ${npiResult.basic.last_name}"`
      );
    }

    const practiceAddress = npiResult.addresses.find(
      (addr) => addr.address_purpose === 'LOCATION'
    ) || npiResult.addresses[0];

    if (practiceAddress) {
      const npiCity = practiceAddress.city?.toLowerCase();
      const npiState = practiceAddress.state?.toLowerCase();
      const npiZip = practiceAddress.postal_code?.substring(0, 5);

      const providerCity = provider.city?.toLowerCase();
      const providerState = provider.state?.toLowerCase();
      const providerZip = provider.zipCode?.substring(0, 5);

      if (
        npiCity === providerCity &&
        npiState === providerState &&
        npiZip === providerZip
      ) {
        matchedFields.address = true;
      } else {
        discrepancies.push(
          `Address mismatch: Provider has "${provider.city}, ${provider.state} ${provider.zipCode}", NPI Registry has "${practiceAddress.city}, ${practiceAddress.state} ${practiceAddress.postal_code}"`
        );
      }

      const npiPhone = this.normalizePhone(practiceAddress.telephone_number);
      const providerPhone = this.normalizePhone(provider.primaryPhone || '');

      if (npiPhone === providerPhone) {
        matchedFields.phone = true;
      } else if (providerPhone) {
        discrepancies.push(
          `Phone mismatch: Provider has "${provider.primaryPhone}", NPI Registry has "${practiceAddress.telephone_number}"`
        );
      }
    }

    if (npiResult.taxonomies.length > 0 && provider.specialties?.length > 0) {
      const npiSpecialties = npiResult.taxonomies.map((t) =>
        t.desc.toLowerCase()
      );
      const providerSpecialties = provider.specialties.map((s: string) =>
        s.toLowerCase()
      );

      const hasMatch = providerSpecialties.some((ps: string) =>
        npiSpecialties.some((ns) => ns.includes(ps) || ps.includes(ns))
      );

      if (hasMatch) {
        matchedFields.specialty = true;
      } else {
        discrepancies.push(
          `Specialty mismatch: Provider has "${provider.specialties.join(', ')}", NPI Registry has "${npiResult.taxonomies[0].desc}"`
        );
      }
    }

    const primaryTaxonomy = npiResult.taxonomies.find((t) => t.primary);
    if (primaryTaxonomy?.license) {
      matchedFields.license = true;
    }

    const matchCount = Object.values(matchedFields).filter(Boolean).length;
    const totalFields = Object.keys(matchedFields).length;
    const confidence = matchCount / totalFields;

    return {
      isValid: confidence > 0.5,
      confidence,
      discrepancies,
      npiData: this.formatNPIData(npiResult),
      matchedFields,
    };
  }

  private formatNPIData(npiResult: NPIResult): any {
    const practiceAddress = npiResult.addresses.find(
      (addr) => addr.address_purpose === 'LOCATION'
    ) || npiResult.addresses[0];

    const primaryTaxonomy = npiResult.taxonomies.find((t) => t.primary) || npiResult.taxonomies[0];

    return {
      npiNumber: npiResult.number,
      firstName: npiResult.basic.first_name,
      lastName: npiResult.basic.last_name,
      middleName: npiResult.basic.middle_name,
      credential: npiResult.basic.credential,
      organizationName: npiResult.basic.name,
      address: practiceAddress ? {
        address1: practiceAddress.address_1,
        address2: practiceAddress.address_2,
        city: practiceAddress.city,
        state: practiceAddress.state,
        zipCode: practiceAddress.postal_code,
        phone: practiceAddress.telephone_number,
      } : null,
      specialty: primaryTaxonomy ? {
        code: primaryTaxonomy.code,
        description: primaryTaxonomy.desc,
        license: primaryTaxonomy.license,
        state: primaryTaxonomy.state,
      } : null,
      allTaxonomies: npiResult.taxonomies,
    };
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async searchByNameAndLocation(
    firstName: string,
    lastName: string,
    state?: string,
    city?: string
  ): Promise<NPIResult[]> {
    try {
      const params: any = {
        first_name: firstName,
        last_name: lastName,
        version: '2.1',
        limit: 10,
      };

      if (state) params.state = state;
      if (city) params.city = city;

      const response = await axios.get<NPIRegistryResponse>(this.BASE_URL, {
        params,
        timeout: this.TIMEOUT,
      });

      return response.data.results || [];
    } catch (error: any) {
      console.error('NPI search error:', error.message);
      throw new Error(`Failed to search NPI Registry: ${error.message}`);
    }
  }
}

export const npiRegistryService = new NPIRegistryService();
