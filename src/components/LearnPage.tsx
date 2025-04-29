import { useNavigate } from 'react-router-dom';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

export const LearnPage = () => {
  const navigate = useNavigate();

  const oems = [
    {
      name: 'Apple',
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Apple-logo.png'
    },
    {
      name: 'Samsung',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Samsung_Logo.svg'
    },
    {
      name: 'Google',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Google_logo_2023.svg'
    },
    {
      name: 'Cisco',
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg'
    },
    {
      name: 'Bosch',
      url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Bosch-logo.svg'
    },
    {
      name: 'Honeywell',
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Honeywell-Logo.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-5 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <RocketLaunchIcon className="w-8 h-8 text-[#009FDB]" />
          <span className="text-2xl font-bold text-[#009FDB]">DeviceCert</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 text-[#009FDB] hover:bg-[#009FDB] hover:text-white rounded-full transition-colors border border-[#009FDB]"
        >
          Login
        </button>
      </nav>

      {/* Hero Section with Background Content */}
      <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-b from-white to-[#F0F8FF]">
        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 z-20">
          <span className="inline-block px-4 py-1.5 bg-[#E2F4FF] text-[#009FDB] rounded-full text-sm mb-6 font-medium tracking-wide">
            AVAILABLE NOW
          </span>
          <h1 className="text-6xl sm:text-7xl font-bold mb-8 text-[#00539B] leading-tight">
            Streamline Device Certification Life Cycles
          </h1>
          <p className="text-xl sm:text-2xl text-[#444444] mb-10 max-w-2xl leading-relaxed">
            Accelerate certifications with precision, security, and real-time insights.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-8 py-3.5 bg-[#009FDB] text-white rounded-full hover:bg-[#007DB0] transition-all duration-300 transform hover:scale-105"
          >
            View Demo
            <img
              src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
              alt="User"
              className="w-6 h-6 rounded-full ml-2"
            />
          </button>
        </div>

        {/* Floating Tags */}
        <div className="absolute inset-0 z-10">
          <h3 className="text-sm sm:text-base font-medium text-[#666666] text-center mt-24 mb-24">
            CAPABILITIES WE WORK ON:
          </h3>
          <div className="absolute left-[15%] top-40 animate-float-diagonal-right duration-2000">
            <div className="w-8 h-8 border-2 border-dotted border-[#009FDB] rounded mb-2" />
            <div className="w-5 h-5 transform rotate-90 mx-auto mb-2 text-[#009FDB]">↑</div>
            <div className="px-4 py-2.5 bg-white/80 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#009FDB] rounded-full" />
              Configurable Workflows
            </div>
          </div>
          <div className="absolute right-[15%] top-40 animate-float-diagonal-left duration-2000">
            <div className="w-10 h-5 border-2 border-dotted border-[#009FDB] rounded mb-2" />
            <div className="w-5 h-5 transform rotate-90 mx-auto mb-2 text-[#009FDB]">↑</div>
            <div className="px-4 py-2.5 bg-white/80 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#009FDB] rounded-full" />
              Dashboards
            </div>
          </div>
          <div className="absolute left-[15%] top-[400px] animate-float-diagonal-right-up duration-2000">
            <div className="w-5 h-10 border-2 border-dotted border-[#009FDB] rounded mb-2" />
            <div className="w-5 h-5 transform rotate-90 mx-auto mb-2 text-[#009FDB]">↑</div>
            <div className="px-4 py-2.5 bg-white/80 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-[#009FDB] rounded-full" />
              Real-time Insights
            </div>
          </div>
        </div>
      </div>

      {/* OEMs Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-[#00539B]">
            Trusted by Leading OEMs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {oems.map((oem, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center p-4 hover:bg-[#F0F8FF] rounded-lg transition-colors duration-300"
              >
                <img 
                  src={oem.url} 
                  alt={oem.name} 
                  className="h-12 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-24 px-5 bg-[#F6FBFF]">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#00539B]">
          Certify Smarter, Certify Faster
        </h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
          <div className="bg-white p-12 rounded-xl shadow-sm w-[500px] transform hover:-translate-y-1 transition-transform">
            <h3 className="text-2xl font-bold mb-6 text-[#00539B]">Who We Are</h3>
            <p className="text-[#444444] text-lg leading-relaxed mb-6">
              DARP 2.0 bridges OEMs to accelerate device certification with speed,
              security, and precision across 5G, IoT, and others.
            </p>
            <a href="#" className="text-[#009FDB] hover:text-[#007DB0] font-medium inline-flex items-center">
              Learn More
              <span className="ml-2">→</span>
            </a>
          </div>
          <div className="bg-white p-12 rounded-xl shadow-sm w-[500px] transform hover:-translate-y-1 transition-transform">
            <h3 className="text-2xl font-bold mb-6 text-[#00539B]">Works with All OEMs</h3>
            <p className="text-[#444444] text-lg leading-relaxed mb-8">
              Supporting IoT and Non-IoT devices from leading OEMs with comprehensive
              certification processes and workflows.
            </p>
            <div className="flex justify-center gap-8">
              {oems.slice(0, 3).map(oem => (
                <img
                  key={oem.name}
                  src={oem.url}
                  alt={oem.name}
                  className="h-8"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Devices Section */}
      <div className="py-24 px-5 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#00539B]">
          Supported Devices
        </h2>
        <div className="flex flex-wrap justify-center gap-12 max-w-7xl mx-auto">
          {['Smartphones', 'Tablets', 'IoT Devices', 'Wearables'].map((device, index) => (
            <div 
              key={device}
              className="bg-[#F6FBFF] p-8 rounded-xl shadow-sm w-[300px] transform hover:-translate-y-2 transition-all hover:shadow-lg"
              style={{
                animation: `float-up 3s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            >
              <div className="w-16 h-16 bg-[#E2F4FF] rounded-full mb-6 mx-auto flex items-center justify-center">
                <RocketLaunchIcon className="w-8 h-8 text-[#009FDB]" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-[#00539B]">{device}</h3>
              <p className="text-[#444444] text-center">
                Comprehensive certification support for {device.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};