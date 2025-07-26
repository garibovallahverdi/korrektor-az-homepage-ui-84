import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';

const VerifyEmailPage: React.FC = () => {
  const { token, verifyToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!token || !verifyToken) {
          throw new Error('Token yoxdur - iki token tələb olunur');
        }

        const res = await apiService.verifyAccount(token, verifyToken);
        console.log(res, 'E-poçt doğrulama uğurlu oldu');
        
        toast.success(res?.message || 'E-poçt doğrulama uğurlu oldu');
        setSuccess(true);
      } catch (err) {
        console.error('Doğrulama xətası:', err);
        toast.error('Doğrulama uğursuz oldu!');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, verifyToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <h2 className="text-xl font-semibold text-gray-800">Hesab doğrulanır...</h2>
              <p className="text-gray-500 text-sm">Zəhmət olmasa gözləyin</p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Hesab doğrulandı!</h2>
                <p className="text-gray-600">E-poçt ünvanınız uğurla təsdiqləndi</p>
              </div>
              <a 
                href="/" 
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana səhifəyə qayıt
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Doğrulama uğursuz oldu</h2>
                <p className="text-gray-600">Təəssüf ki, hesabınızı doğrulaya bilmədik</p>
              </div>
              <a 
                href="/" 
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana səhifəyə qayıt
              </a>
            </div>
          )}
        </div>
        
        {/* Alt məlumat */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Problemlə qarşılaşdınız? 
            <a href="/#contact" className="text-blue-600 hover:text-blue-800 ml-1 font-medium">
              Bizimlə əlaqə saxlayın
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;