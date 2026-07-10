// components/rewards/ShippingAddressForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  User, 
  Home,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ShippingAddress } from '@/types/avatar';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STR = {
  th: {
    title: 'ที่อยู่จัดส่ง',
    subtitle: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
    fullNameLabel: 'ชื่อ-นามสกุล (ผู้รับ)',
    fullNamePlaceholder: 'ชื่อ-นามสกุล',
    fullNameRequired: 'กรุณากรอกชื่อ-นามสกุล',
    phoneLabel: 'เบอร์โทรศัพท์',
    phoneRequired: 'กรุณากรอกเบอร์โทรศัพท์',
    phoneInvalid: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)',
    phoneHint: 'กรอกเฉพาะตัวเลข 10 หลัก',
    addressLabel: 'ที่อยู่',
    addressRequired: 'กรุณากรอกที่อยู่',
    addressPlaceholder: 'บ้านเลขที่ หมู่ ซอย ถนน',
    address2Label: 'รายละเอียดเพิ่มเติม (ไม่บังคับ)',
    address2Placeholder: 'อาคาร ชั้น ห้อง หรือจุดสังเกต',
    subDistrictLabel: 'ตำบล/แขวง',
    subDistrictRequired: 'กรุณากรอกตำบล/แขวง',
    subDistrictPlaceholder: 'ตำบล หรือ แขวง',
    districtLabel: 'อำเภอ/เขต',
    districtRequired: 'กรุณากรอกอำเภอ/เขต',
    districtPlaceholder: 'อำเภอ หรือ เขต',
    provinceLabel: 'จังหวัด',
    provinceRequired: 'กรุณากรอกจังหวัด',
    provincePlaceholder: 'จังหวัด',
    postalLabel: 'รหัสไปรษณีย์',
    postalRequired: 'กรุณากรอกรหัสไปรษณีย์',
    postalInvalid: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก',
    cancel: 'ยกเลิก',
    saving: 'กำลังบันทึก...',
    confirm: 'ยืนยันที่อยู่',
  },
  en: {
    title: 'Shipping Address',
    subtitle: 'Please fill in every field correctly',
    fullNameLabel: 'Full name (recipient)',
    fullNamePlaceholder: 'Full name',
    fullNameRequired: 'Please enter the full name',
    phoneLabel: 'Phone number',
    phoneRequired: 'Please enter a phone number',
    phoneInvalid: 'Invalid phone number (example: 081-234-5678)',
    phoneHint: 'Numbers only, 10 digits',
    addressLabel: 'Address',
    addressRequired: 'Please enter the address',
    addressPlaceholder: 'House no., moo, soi, road',
    address2Label: 'Extra details (optional)',
    address2Placeholder: 'Building, floor, room, or landmark',
    subDistrictLabel: 'Sub-district',
    subDistrictRequired: 'Please enter the sub-district',
    subDistrictPlaceholder: 'Sub-district (tambon/khwaeng)',
    districtLabel: 'District',
    districtRequired: 'Please enter the district',
    districtPlaceholder: 'District (amphoe/khet)',
    provinceLabel: 'Province',
    provinceRequired: 'Please enter the province',
    provincePlaceholder: 'Province',
    postalLabel: 'Postal code',
    postalRequired: 'Please enter the postal code',
    postalInvalid: 'Postal code must be 5 digits',
    cancel: 'Cancel',
    saving: 'Saving...',
    confirm: 'Confirm address',
  },
} as const;

interface ShippingAddressFormProps {
  onSubmit: (address: ShippingAddress) => void;
  onCancel: () => void;
  loading?: boolean;
  savedAddress?: ShippingAddress | null;
}

export default function ShippingAddressForm({
  onSubmit,
  onCancel,
  loading = false,
  savedAddress = null
}: ShippingAddressFormProps) {
  const { lang } = useLanguage();
  const L = STR[lang];
  // Form fields
  const [fullName, setFullName] = useState(savedAddress?.fullName || '');
  const [phone, setPhone] = useState(savedAddress?.phone || '');
  const [addressLine1, setAddressLine1] = useState(savedAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(savedAddress?.addressLine2 || '');
  const [subDistrict, setSubDistrict] = useState(savedAddress?.subDistrict || '');
  const [district, setDistrict] = useState(savedAddress?.district || '');
  const [province, setProvince] = useState(savedAddress?.province || '');
  const [postalCode, setPostalCode] = useState(savedAddress?.postalCode || '');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Phone handling functions
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const validateThaiPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const mobileRegex = /^(08|09|06)\d{8}$/;
    const landlineRegex = /^(02|03|04|05|07)\d{7}$/;
    return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
  };

  const formatThaiPhone = (phone: string): string => {
    const cleaned = phone.replace(/[\s-]/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 9 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
    }
    
    return phone;
  };
  
  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = L.fullNameRequired;
    }

    if (!phone) {
      newErrors.phone = L.phoneRequired;
    } else if (!validateThaiPhone(phone)) {
      newErrors.phone = L.phoneInvalid;
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = L.addressRequired;
    }

    if (!subDistrict.trim()) {
      newErrors.subDistrict = L.subDistrictRequired;
    }

    if (!district.trim()) {
      newErrors.district = L.districtRequired;
    }

    if (!province.trim()) {
      newErrors.province = L.provinceRequired;
    }

    if (!postalCode) {
      newErrors.postalCode = L.postalRequired;
    } else if (!/^\d{5}$/.test(postalCode)) {
      newErrors.postalCode = L.postalInvalid;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const address: ShippingAddress = {
        fullName: fullName.trim(),
        phone: formatThaiPhone(phone),
        addressLine1: addressLine1.trim(),
        subDistrict: subDistrict.trim(),
        district: district.trim(),
        province: province.trim(),
        postalCode
      };
      
      // Add addressLine2 only if it has value
      if (addressLine2.trim()) {
        address.addressLine2 = addressLine2.trim();
      }
      
      onSubmit(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-metaverse-purple/20 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-metaverse-purple" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{L.title}</h3>
        <p className="text-white/60">{L.subtitle}</p>
      </div>
      
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          {L.fullNameLabel} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.fullName ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder={L.fullNamePlaceholder}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.fullName}
          </p>
        )}
      </div>
      
      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          {L.phoneLabel} <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.phone ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder="081234xxxx"
          maxLength={10}
        />
        <p className="mt-1 text-xs text-white/40">{L.phoneHint}</p>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>
      
      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          <Home className="w-4 h-4 inline mr-1" />
          {L.addressLabel} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.addressLine1 ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder={L.addressPlaceholder}
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.addressLine1}
          </p>
        )}
      </div>
      
      {/* Address Line 2 (Optional) */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          {L.address2Label}
        </label>
        <input
          type="text"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
          placeholder={L.address2Placeholder}
        />
      </div>
      
      {/* Sub-district and District */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-district */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {L.subDistrictLabel} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={subDistrict}
            onChange={(e) => setSubDistrict(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
              errors.subDistrict ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder={L.subDistrictPlaceholder}
          />
          {errors.subDistrict && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.subDistrict}
            </p>
          )}
        </div>
        
        {/* District */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {L.districtLabel} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
              errors.district ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder={L.districtPlaceholder}
          />
          {errors.district && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.district}
            </p>
          )}
        </div>
      </div>
      
      {/* Province and Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {L.provinceLabel} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
              errors.province ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder={L.provincePlaceholder}
          />
          {errors.province && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.province}
            </p>
          )}
        </div>
        
        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            {L.postalLabel} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
              errors.postalCode ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder="12345"
            maxLength={5}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.postalCode}
            </p>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {L.cancel}
        </motion.button>
        
        <motion.button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {L.saving}
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              {L.confirm}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}