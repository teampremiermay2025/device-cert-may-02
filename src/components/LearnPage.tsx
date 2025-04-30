import { useNavigate } from 'react-router-dom';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

export const LearnPage = () => {
  const navigate = useNavigate();

  const oems = [
    {
      name: 'Apple',
      url: '/assets/apple-logo.svg'
    },
    {
      name: 'Samsung',
      url: '/assets/Samsung_Logo.svg'
    },
    {
      name: 'Google',
      url: '/assets/Google_2015_logo.svg'
    },
    {
      name: 'Cisco',
      url: '/assets/cisco-logo.svg'
    },
    {
      name: 'Bosch',
      url: '/assets/Bosch-logo.svg'
    },
    {
      name: 'Honeywell',
      url: '/assets/Honeywell_logo.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-[#1E3A8A]/95 backdrop-blur-sm border-b border-[#1E3A8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="w-8 h-8 text-white" />
              <span className="ml-2 text-2xl font-bold text-white">DeviceCert</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-6 py-2.5 border border-white text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-[#1E3A8A] to-[#182D60] hover:from-[#182D60] hover:to-[#15254C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5 mr-2 text-white" />
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-32 sm:pt-40 sm:pb-40">
        {/* Floating Tags Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute left-[15%] top-40 animate-float-diagonal-right duration-2000">
          
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A]/20 to-[#182D60]/20 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#1E3A8A] rounded-full" />
              Configurable Workflows
            </div>
          </div>
          <div className="absolute right-[15%] top-40 animate-float-diagonal-left duration-2000">
            
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A]/20 to-[#182D60]/20 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#1E3A8A] rounded-full" />
              Dashboards
            </div>
          </div>
          <div className="absolute left-[15%] top-[400px] animate-float-diagonal-right-up duration-2000">
           
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A]/20 to-[#182D60]/20 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#1E3A8A] rounded-full" />
              Real-time Insights
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-[#1E3A8A]/20 to-[#182D60]/20 text-[#1E3A8A] rounded-full text-sm font-medium tracking-wide">
              <span className="animate-pulse">Now Available</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#1E3A8A]">
              Streamline Device Certification Life Cycles
            </h1>
            <p className="text-xl sm:text-2xl text-[#374151] max-w-3xl mx-auto">
              Accelerate certifications with precision, security, and real-time insights.
            </p>
            <div className="mt-8 sm:mt-10">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#182D60] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
              >
                Try Now
                <svg className="w-5 h-5 ml-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 sm:py-20 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] mb-12">
              Why Choose DeviceCert
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E3A8A]/10 to-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">Real-time Insights</h3>
              <p className="text-[#4B5563]">Track certification progress in real-time with detailed analytics and reporting.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E3A8A]/10 to-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">Configurable Workflows</h3>
              <p className="text-[#4B5563]">Customize certification processes to match your organization's needs.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E3A8A]/10 to-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">Secure Dashboard</h3>
              <p className="text-[#4B5563]">Access all your certification data in one secure, centralized location.</p>
            </div>
          </div>
        </div>
      </div>

      {/* OEMs Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-br from-[#F5F7FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1E3A8A] mb-12">
          Works with all OEMs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {oems.map((oem, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <img 
                  src={oem.url} 
                  alt={oem.name} 
                  className="w-16 h-16 object-contain"
                  onError={e => (e.currentTarget.src = '/assets/fallback.png')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};