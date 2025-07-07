// components/rewards/ShippingAddressForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  User, 
  Home,
  Search,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ShippingAddress } from '@/types/avatar';
import { 
  parseThaiAddressData,
  getProvinces,
  getDistrictsByProvince,
  getSubdistrictsByDistrict,
  getPostalCode,
  validateThaiPhone,
  formatThaiPhone,
  validatePostalCode
} from '@/lib/utils/thaiAddress';
import { thaiAddressData } from '@/lib/data/thaiAddress';

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
  // Parse address data once
  const [addressData] = useState(() => parseThaiAddressData(thaiAddressData));
  
  // Form fields
  const [fullName, setFullName] = useState(savedAddress?.fullName || '');
  const [phone, setPhone] = useState(savedAddress?.phone || '');
  const [addressLine1, setAddressLine1] = useState(savedAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(savedAddress?.addressLine2 || '');
  const [province, setProvince] = useState(savedAddress?.province || '');
  const [district, setDistrict] = useState(savedAddress?.district || '');
  const [subDistrict, setSubDistrict] = useState(savedAddress?.subDistrict || '');
  const [postalCode, setPostalCode] = useState(savedAddress?.postalCode || '');
  
  // Dropdown data
  const [provinces] = useState(() => getProvinces(addressData));
  const [districts, setDistricts] = useState<string[]>([]);
  const [subDistricts, setSubDistricts] = useState<Array<{ subdistrict: string; postalCode: number }>>([]);
  
  // Search states
  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [subDistrictSearch, setSubDistrictSearch] = useState('');
  
  // Dropdown visibility
  const [showProvinces, setShowProvinces] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [showSubDistricts, setShowSubDistricts] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load districts when province changes
  useEffect(() => {
    if (province) {
      const districtList = getDistrictsByProvince(addressData, province);
      setDistricts(districtList);
      
      // Reset district and subdistrict if not in new list
      if (!districtList.includes(district)) {
        setDistrict('');
        setSubDistrict('');
        setPostalCode('');
      }
    } else {
      setDistricts([]);
      setDistrict('');
      setSubDistrict('');
      setPostalCode('');
    }
  }, [province, addressData, district]);
  
  // Load subdistricts when district changes
  useEffect(() => {
    if (province && district) {
      const subDistrictList = getSubdistrictsByDistrict(addressData, province, district);
      setSubDistricts(subDistrictList);
      
      // Reset subdistrict if not in new list
      const currentSubDistrict = subDistrictList.find(s => s.subdistrict === subDistrict);
      if (!currentSubDistrict) {
        setSubDistrict('');
        setPostalCode('');
      }
    } else {
      setSubDistricts([]);
      setSubDistrict('');
      setPostalCode('');
    }
  }, [province, district, addressData, subDistrict]);
  
  // Auto-fill postal code when subdistrict is selected
  useEffect(() => {
    if (province && district && subDistrict) {
      const code = getPostalCode(addressData, province, district, subDistrict);
      if (code) {
        setPostalCode(code.toString());
      }
    }
  }, [province, district, subDistrict, addressData]);
  
  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    }
    
    if (!phone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!validateThaiPhone(phone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง';
    }
    
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'กรุณากรอกที่อยู่';
    }
    
    if (!province) {
      newErrors.province = 'กรุณาเลือกจังหวัด';
    }
    
    if (!district) {
      newErrors.district = 'กรุณาเลือกอำเภอ/เขต';
    }
    
    if (!subDistrict) {
      newErrors.subDistrict = 'กรุณาเลือกตำบล/แขวง';
    }
    
    if (!postalCode) {
      newErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    } else if (!validatePostalCode(postalCode)) {
      newErrors.postalCode = 'รหัสไปรษณีย์ไม่ถูกต้อง';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const address: ShippingAddress = {
        fullName: fullName.trim(),
        phone: formatThaiPhone(phone),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        subDistrict,
        district,
        province,
        postalCode
      };
      
      onSubmit(address);
    }
  };
  
  // Filter functions
  const filteredProvinces = provinces.filter(p => 
    p.toLowerCase().includes(provinceSearch.toLowerCase())
  );
  
  const filteredDistricts = districts.filter(d => 
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );
  
  const filteredSubDistricts = subDistricts.filter(s => 
    s.subdistrict.toLowerCase().includes(subDistrictSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-metaverse-purple/20 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-metaverse-purple" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">ที่อยู่จัดส่ง</h3>
        <p className="text-white/60">กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
      </div>
      
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          ชื่อ-นามสกุล (ผู้รับ)
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.fullName ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder="ชื่อ-นามสกุล"
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
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.phone ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder="08x-xxx-xxxx"
        />
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
          ที่อยู่ (บ้านเลขที่, หมู่, ถนน)
        </label>
        <input
          type="text"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
            errors.addressLine1 ? 'border-red-400' : 'border-metaverse-purple/30'
          }`}
          placeholder="123 หมู่ 4 ถนนสุขุมวิท"
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
          ที่อยู่เพิ่มเติม (ไม่บังคับ)
        </label>
        <input
          type="text"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
          placeholder="อาคาร, ชั้น, ห้อง (ถ้ามี)"
        />
      </div>
      
      {/* Province */}
      <div className="relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          จังหวัด
        </label>
        <div className="relative">
          <input
            type="text"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setProvinceSearch(e.target.value);
              setShowProvinces(true);
            }}
            onFocus={() => setShowProvinces(true)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 pr-10 ${
              errors.province ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder="เลือกจังหวัด"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        </div>
        
        {/* Province Dropdown */}
        <AnimatePresence>
          {showProvinces && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-metaverse-black/95 backdrop-blur-md border border-metaverse-purple/30 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              {filteredProvinces.length > 0 ? (
                filteredProvinces.map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setProvince(prov);
                      setProvinceSearch('');
                      setShowProvinces(false);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-metaverse-purple/20 transition flex items-center justify-between"
                  >
                    {prov}
                    {province === prov && <Check className="w-4 h-4 text-green-400" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-white/40">ไม่พบจังหวัดที่ค้นหา</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {errors.province && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.province}
          </p>
        )}
      </div>
      
      {/* District */}
      <div className="relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          อำเภอ/เขต
        </label>
        <div className="relative">
          <input
            type="text"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setDistrictSearch(e.target.value);
              setShowDistricts(true);
            }}
            onFocus={() => setShowDistricts(true)}
            disabled={!province}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.district ? 'border-red-400' : 'border-metaverse-purple/30'
            }`}
            placeholder={province ? "เลือกอำเภอ/เขต" : "กรุณาเลือกจังหวัดก่อน"}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        </div>
        
        {/* District Dropdown */}
        <AnimatePresence>
          {showDistricts && districts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-metaverse-black/95 backdrop-blur-md border border-metaverse-purple/30 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      setDistrict(dist);
                      setDistrictSearch('');
                      setShowDistricts(false);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-metaverse-purple/20 transition flex items-center justify-between"
                  >
                    {dist}
                    {district === dist && <Check className="w-4 h-4 text-green-400" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-white/40">ไม่พบอำเภอ/เขตที่ค้นหา</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {errors.district && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.district}
          </p>
        )}
      </div>
      
      {/* Sub-district and Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-district */}
        <div className="relative">
          <label className="block text-sm font-medium text-white/80 mb-2">
            ตำบล/แขวง
          </label>
          <div className="relative">
            <input
              type="text"
              value={subDistrict}
              onChange={(e) => {
                setSubDistrict(e.target.value);
                setSubDistrictSearch(e.target.value);
                setShowSubDistricts(true);
              }}
              onFocus={() => setShowSubDistricts(true)}
              disabled={!district}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.subDistrict ? 'border-red-400' : 'border-metaverse-purple/30'
              }`}
              placeholder={district ? "เลือกตำบล/แขวง" : "กรุณาเลือกอำเภอก่อน"}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          </div>
          
          {/* Sub-district Dropdown */}
          <AnimatePresence>
            {showSubDistricts && subDistricts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-metaverse-black/95 backdrop-blur-md border border-metaverse-purple/30 rounded-xl shadow-xl max-h-60 overflow-y-auto"
              >
                {filteredSubDistricts.length > 0 ? (
                  filteredSubDistricts.map((sub) => (
                    <button
                      key={sub.subdistrict}
                      type="button"
                      onClick={() => {
                        setSubDistrict(sub.subdistrict);
                        setPostalCode(sub.postalCode.toString());
                        setSubDistrictSearch('');
                        setShowSubDistricts(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-metaverse-purple/20 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>{sub.subdistrict}</span>
                        <span className="text-sm text-white/60">{sub.postalCode}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-white/40">ไม่พบตำบล/แขวงที่ค้นหา</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {errors.subDistrict && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.subDistrict}
            </p>
          )}
        </div>
        
        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            รหัสไปรษณีย์
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
      
      {/* Click outside to close dropdowns */}
      {(showProvinces || showDistricts || showSubDistricts) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowProvinces(false);
            setShowDistricts(false);
            setShowSubDistricts(false);
            setProvinceSearch('');
            setDistrictSearch('');
            setSubDistrictSearch('');
          }}
        />
      )}
      
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
          ยกเลิก
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
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              ยืนยันที่อยู่
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}