// lib/utils/thaiAddress.ts
interface SubdistrictData {
  subdistrict: string;
  postalCode: number;
}

interface DistrictData {
  district: string;
  subdistricts: SubdistrictData[];
}

interface AddressData {
  province: string;
  districts: DistrictData[];
}

// Parse the Thai address data
export function parseThaiAddressData(rawData: any): AddressData[] {
  const provinces: AddressData[] = [];
  
  if (!rawData || !rawData.data) {
    console.error('Invalid address data format');
    return provinces;
  }
  
  // The data structure is [province_name, [[district_data]]]
  for (const [provinceName, districtData] of rawData.data) {
    const province: AddressData = {
      province: provinceName,
      districts: []
    };
    
    // Parse districts
    if (Array.isArray(districtData)) {
      for (const [districtName, subdistrictData] of districtData) {
        const district: DistrictData = {
          district: districtName,
          subdistricts: []
        };
        
        // Parse subdistricts
        if (Array.isArray(subdistrictData)) {
          for (const subdistrictInfo of subdistrictData) {
            if (Array.isArray(subdistrictInfo) && subdistrictInfo.length === 2) {
              const [subdistrict, postalCode] = subdistrictInfo;
              
              // Convert numeric references to actual names
              const subdistrictName = typeof subdistrict === 'number' ? 
                getSubdistrictName(subdistrict, rawData.lookup, rawData.words) : 
                subdistrict;
              
              district.subdistricts.push({
                subdistrict: subdistrictName,
                postalCode: postalCode
              });
            }
          }
        }
        
        province.districts.push(district);
      }
    }
    
    provinces.push(province);
  }
  
  return provinces;
}

// Helper function to decode subdistrict names from lookup
function getSubdistrictName(index: number, lookup: string, words: string): string {
  const lookupArray = lookup ? lookup.split('|') : [];
  const wordsArray = words ? words.split('|') : [];
  
  if (index < lookupArray.length) {
    return lookupArray[index];
  }
  
  // If not in lookup, try to construct from words
  // This is a simplified version - in real implementation would need proper decoding
  return `ตำบล ${index}`;
}

// Get all provinces
export function getProvinces(addressData: AddressData[]): string[] {
  return addressData.map(p => p.province).sort();
}

// Get districts by province
export function getDistrictsByProvince(addressData: AddressData[], province: string): string[] {
  const provinceData = addressData.find(p => p.province === province);
  if (!provinceData) return [];
  
  return provinceData.districts.map(d => d.district).sort();
}

// Get subdistricts by province and district
export function getSubdistrictsByDistrict(
  addressData: AddressData[], 
  province: string, 
  district: string
): SubdistrictData[] {
  const provinceData = addressData.find(p => p.province === province);
  if (!provinceData) return [];
  
  const districtData = provinceData.districts.find(d => d.district === district);
  if (!districtData) return [];
  
  return districtData.subdistricts.sort((a, b) => a.subdistrict.localeCompare(b.subdistrict));
}

// Get postal code
export function getPostalCode(
  addressData: AddressData[],
  province: string,
  district: string,
  subdistrict: string
): number | null {
  const provinceData = addressData.find(p => p.province === province);
  if (!provinceData) return null;
  
  const districtData = provinceData.districts.find(d => d.district === district);
  if (!districtData) return null;
  
  const subdistrictData = districtData.subdistricts.find(s => s.subdistrict === subdistrict);
  return subdistrictData?.postalCode || null;
}

// Validate Thai phone number
export function validateThaiPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Thai mobile: 08, 09, 06 followed by 8 digits
  // Thai landline: 02, 03, 04, 05, 07 followed by 7 digits
  const mobileRegex = /^(08|09|06)\d{8}$/;
  const landlineRegex = /^(02|03|04|05|07)\d{7}$/;
  
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

// Format Thai phone number
export function formatThaiPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Mobile: 08x-xxx-xxxx
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 9 && cleaned.startsWith('0')) {
    // Landline: 02-xxx-xxxx
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
}

// Validate postal code
export function validatePostalCode(postalCode: string): boolean {
  // Thai postal codes are 5 digits
  return /^\d{5}$/.test(postalCode);
}