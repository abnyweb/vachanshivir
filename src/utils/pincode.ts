/**
 * High-performance Indian PIN Code Lookup Utility
 * Integrates local proxy, Postal Department API, and fallback circle mapping.
 */

export interface PincodeLookupResult {
  city: string;
  state: string;
  district: string;
  success: boolean;
  message?: string;
  isEstimate?: boolean;
}

// In-memory frontend cache
const clientCache = new Map<string, PincodeLookupResult>();

// Instant Indian State prefix lookup (first 2 digits)
const INDIAN_PIN_PREFIX_MAP: Record<string, { state: string; sampleCity: string }> = {
  '11': { state: 'Delhi', sampleCity: 'New Delhi' },
  '12': { state: 'Haryana', sampleCity: 'Gurugram' },
  '13': { state: 'Haryana', sampleCity: 'Ambala' },
  '14': { state: 'Punjab', sampleCity: 'Ludhiana' },
  '15': { state: 'Punjab', sampleCity: 'Bathinda' },
  '16': { state: 'Chandigarh', sampleCity: 'Chandigarh' },
  '17': { state: 'Himachal Pradesh', sampleCity: 'Shimla' },
  '18': { state: 'Jammu & Kashmir', sampleCity: 'Jammu' },
  '19': { state: 'Jammu & Kashmir', sampleCity: 'Srinagar' },
  '20': { state: 'Uttar Pradesh', sampleCity: 'Aligarh' },
  '21': { state: 'Uttar Pradesh', sampleCity: 'Prayagraj' },
  '22': { state: 'Uttar Pradesh', sampleCity: 'Lucknow' },
  '23': { state: 'Uttar Pradesh', sampleCity: 'Varanasi' },
  '24': { state: 'Uttarakhand', sampleCity: 'Dehradun' },
  '25': { state: 'Uttar Pradesh', sampleCity: 'Meerut' },
  '26': { state: 'Uttar Pradesh', sampleCity: 'Bareilly' },
  '27': { state: 'Uttar Pradesh', sampleCity: 'Gorakhpur' },
  '28': { state: 'Uttar Pradesh', sampleCity: 'Jhansi' },
  '30': { state: 'Rajasthan', sampleCity: 'Jaipur' },
  '31': { state: 'Rajasthan', sampleCity: 'Udaipur' },
  '32': { state: 'Rajasthan', sampleCity: 'Kota' },
  '33': { state: 'Rajasthan', sampleCity: 'Bikaner' },
  '34': { state: 'Rajasthan', sampleCity: 'Jodhpur' },
  '36': { state: 'Gujarat', sampleCity: 'Rajkot' },
  '37': { state: 'Gujarat', sampleCity: 'Jamnagar' },
  '38': { state: 'Gujarat', sampleCity: 'Ahmedabad' },
  '39': { state: 'Gujarat', sampleCity: 'Surat' },
  '40': { state: 'Maharashtra', sampleCity: 'Mumbai' },
  '41': { state: 'Maharashtra', sampleCity: 'Pune' },
  '42': { state: 'Maharashtra', sampleCity: 'Nashik' },
  '43': { state: 'Maharashtra', sampleCity: 'Chhatrapati Sambhajinagar' },
  '44': { state: 'Maharashtra', sampleCity: 'Nagpur' },
  '45': { state: 'Madhya Pradesh', sampleCity: 'Indore' },
  '46': { state: 'Madhya Pradesh', sampleCity: 'Bhopal' },
  '47': { state: 'Madhya Pradesh', sampleCity: 'Gwalior' },
  '48': { state: 'Madhya Pradesh', sampleCity: 'Jabalpur' },
  '49': { state: 'Chhattisgarh', sampleCity: 'Raipur' },
  '50': { state: 'Telangana', sampleCity: 'Hyderabad' },
  '51': { state: 'Andhra Pradesh', sampleCity: 'Tirupati' },
  '52': { state: 'Andhra Pradesh', sampleCity: 'Vijayawada' },
  '53': { state: 'Andhra Pradesh', sampleCity: 'Visakhapatnam' },
  '56': { state: 'Karnataka', sampleCity: 'Bengaluru' },
  '57': { state: 'Karnataka', sampleCity: 'Mangaluru' },
  '58': { state: 'Karnataka', sampleCity: 'Hubballi' },
  '59': { state: 'Karnataka', sampleCity: 'Belagavi' },
  '60': { state: 'Tamil Nadu', sampleCity: 'Chennai' },
  '61': { state: 'Tamil Nadu', sampleCity: 'Thanjavur' },
  '62': { state: 'Tamil Nadu', sampleCity: 'Madurai' },
  '63': { state: 'Tamil Nadu', sampleCity: 'Salem' },
  '64': { state: 'Tamil Nadu', sampleCity: 'Coimbatore' },
  '67': { state: 'Kerala', sampleCity: 'Kozhikode' },
  '68': { state: 'Kerala', sampleCity: 'Kochi' },
  '69': { state: 'Kerala', sampleCity: 'Thiruvananthapuram' },
  '70': { state: 'West Bengal', sampleCity: 'Kolkata' },
  '71': { state: 'West Bengal', sampleCity: 'Howrah' },
  '72': { state: 'West Bengal', sampleCity: 'Medinipur' },
  '73': { state: 'West Bengal', sampleCity: 'Siliguri' },
  '74': { state: 'West Bengal', sampleCity: 'North 24 Parganas' },
  '75': { state: 'Odisha', sampleCity: 'Bhubaneswar / Puri' },
  '76': { state: 'Odisha', sampleCity: 'Berhampur' },
  '77': { state: 'Odisha', sampleCity: 'Rourkela' },
  '78': { state: 'Assam', sampleCity: 'Guwahati' },
  '79': { state: 'North Eastern States', sampleCity: 'Shillong' },
  '80': { state: 'Bihar', sampleCity: 'Patna' },
  '81': { state: 'Bihar / Jharkhand', sampleCity: 'Bhagalpur' },
  '82': { state: 'Bihar / Jharkhand', sampleCity: 'Gaya / Bokaro' },
  '83': { state: 'Jharkhand', sampleCity: 'Ranchi' },
  '84': { state: 'Bihar', sampleCity: 'Muzaffarpur' },
  '85': { state: 'Bihar', sampleCity: 'Purnea' },
};

export async function lookupIndianPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.replace(/\D/g, '').trim();

  if (cleanPin.length !== 6) {
    return {
      success: false,
      city: '',
      state: '',
      district: '',
      message: 'पिन कोड 6 अंकों का होना चाहिए (PIN must be 6 digits)',
    };
  }

  // 1. Check in-memory client cache
  if (clientCache.has(cleanPin)) {
    return clientCache.get(cleanPin)!;
  }

  // 2. Try proxy endpoint on local server first (Fast, no CORS)
  try {
    const res = await fetch(`/api/pincode/${cleanPin}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.city && data.state) {
        const result: PincodeLookupResult = {
          success: true,
          city: data.city,
          state: data.state,
          district: data.district || data.city,
          message: `स्थान स्वतः प्राप्त हुआ: ${data.city}, ${data.state}`,
        };
        clientCache.set(cleanPin, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Local proxy pincode error, trying direct public API:', err);
  }

  // 3. Fallback to direct Postal Department API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const district = po.District || po.Block || po.Name || '';
        const state = po.State || '';

        const result: PincodeLookupResult = {
          success: true,
          city: district,
          state: state,
          district: district,
          message: `स्थान स्वतः प्राप्त हुआ: ${district}, ${state}`,
        };
        clientCache.set(cleanPin, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Public postal pincode API error:', err);
  }

  // 4. Regional Fallback based on 2-digit PIN code circle
  const prefix2 = cleanPin.substring(0, 2);
  const regional = INDIAN_PIN_PREFIX_MAP[prefix2];
  if (regional) {
    const result: PincodeLookupResult = {
      success: true,
      city: regional.sampleCity,
      state: regional.state,
      district: regional.sampleCity,
      isEstimate: true,
      message: `राज्य स्वतः पहचाना गया: ${regional.state}`,
    };
    clientCache.set(cleanPin, result);
    return result;
  }

  return {
    success: false,
    city: '',
    state: '',
    district: '',
    message: 'इस पिन कोड का स्थान स्वतः नहीं मिला, कृपया शहर व राज्य स्वयं भरें।',
  };
}
