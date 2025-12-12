import axios from 'axios';

interface GoogleMapsValidationResult {
  isValid: boolean;
  confidence: number;
  formattedAddress: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  addressComponents: {
    streetNumber?: string;
    route?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  placeId: string | null;
  phoneNumber: string | null;
  businessName: string | null;
  businessType: string | null;
  discrepancies: string[];
}

export class GoogleMapsService {
  private readonly GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly PLACES_API = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  private readonly PLACE_DETAILS_API = 'https://maps.googleapis.com/maps/api/place/details/json';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    console.log('[GoogleMapsService] Initializing with API key:', this.apiKey ? `${this.apiKey.substring(0, 20)}...` : 'NOT SET');
    if (!this.apiKey) {
      console.warn('[GoogleMapsService] API key not found. Google Maps validation will be skipped.');
    }
  }

  async validateAddress(address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): Promise<GoogleMapsValidationResult> {
    if (!this.apiKey) {
      return this.getEmptyResult('Google Maps API key not configured');
    }

    try {
      const addressString = this.formatAddressString(address);
      
      const response = await axios.get(this.GEOCODING_API, {
        params: {
          address: addressString,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.results[0]) {
        return this.getEmptyResult('Address not found in Google Maps');
      }

      const result = response.data.results[0];
      const components = this.parseAddressComponents(result.address_components);

      const discrepancies: string[] = [];
      let matchCount = 0;
      let totalFields = 0;

      if (address.city && components.city) {
        totalFields++;
        if (address.city.toLowerCase() === components.city.toLowerCase()) {
          matchCount++;
        } else {
          discrepancies.push(`City: expected "${address.city}", Google says "${components.city}"`);
        }
      }

      if (address.state && components.state) {
        totalFields++;
        if (address.state.toLowerCase() === components.state.toLowerCase()) {
          matchCount++;
        } else {
          discrepancies.push(`State: expected "${address.state}", Google says "${components.state}"`);
        }
      }

      if (address.zipCode && components.zipCode) {
        totalFields++;
        const normalizedZip1 = address.zipCode.substring(0, 5);
        const normalizedZip2 = components.zipCode.substring(0, 5);
        if (normalizedZip1 === normalizedZip2) {
          matchCount++;
        } else {
          discrepancies.push(`ZIP: expected "${address.zipCode}", Google says "${components.zipCode}"`);
        }
      }

      const confidence = totalFields > 0 ? matchCount / totalFields : 0;

      return {
        isValid: confidence > 0.7,
        confidence,
        formattedAddress: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        addressComponents: components,
        placeId: result.place_id,
        phoneNumber: null,
        businessName: null,
        businessType: null,
        discrepancies,
      };
    } catch (error: any) {
      console.error('[GoogleMapsService] Geocoding error:', error.message);
      return this.getEmptyResult(`API error: ${error.message}`);
    }
  }

  async findProviderBusiness(providerName: string, address: string): Promise<GoogleMapsValidationResult> {
    if (!this.apiKey) {
      return this.getEmptyResult('Google Maps API key not configured');
    }

    try {
      const query = `${providerName} ${address}`;
      
      const findResponse = await axios.get(this.PLACES_API, {
        params: {
          input: query,
          inputtype: 'textquery',
          fields: 'place_id,name,formatted_address',
          key: this.apiKey,
        },
      });

      if (findResponse.data.status !== 'OK' || !findResponse.data.candidates[0]) {
        return this.getEmptyResult('Business not found in Google Places');
      }

      const placeId = findResponse.data.candidates[0].place_id;

      const detailsResponse = await axios.get(this.PLACE_DETAILS_API, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,address_components,geometry,types',
          key: this.apiKey,
        },
      });

      if (detailsResponse.data.status !== 'OK') {
        return this.getEmptyResult('Could not fetch place details');
      }

      const place = detailsResponse.data.result;
      const components = this.parseAddressComponents(place.address_components);

      return {
        isValid: true,
        confidence: 1.0,
        formattedAddress: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        addressComponents: components,
        placeId: placeId,
        phoneNumber: place.formatted_phone_number || null,
        businessName: place.name,
        businessType: place.types?.[0] || null,
        discrepancies: [],
      };
    } catch (error: any) {
      console.error('[GoogleMapsService] Places API error:', error.message);
      return this.getEmptyResult(`API error: ${error.message}`);
    }
  }

  private formatAddressString(address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): string {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);

    return parts.join(', ');
  }

  private parseAddressComponents(components: any[]): {
    streetNumber?: string;
    route?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } {
    const result: any = {};

    for (const component of components) {
      if (component.types.includes('street_number')) {
        result.streetNumber = component.long_name;
      } else if (component.types.includes('route')) {
        result.route = component.long_name;
      } else if (component.types.includes('locality')) {
        result.city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        result.state = component.short_name;
      } else if (component.types.includes('postal_code')) {
        result.zipCode = component.long_name;
      } else if (component.types.includes('country')) {
        result.country = component.short_name;
      }
    }

    return result;
  }

  private getEmptyResult(reason: string): GoogleMapsValidationResult {
    return {
      isValid: false,
      confidence: 0,
      formattedAddress: null,
      coordinates: null,
      addressComponents: null,
      placeId: null,
      phoneNumber: null,
      businessName: null,
      businessType: null,
      discrepancies: [reason],
    };
  }
}

export const googleMapsService = new GoogleMapsService();
