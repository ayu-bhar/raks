import Link from "next/link";
import { 
  Ticket, 
  CalendarDays, 
  AlertCircle, 
  LayoutDashboard, 
  ArrowRight, 
  GraduationCap,
  Store,
  Building,
  ChevronDown // Added for the dropdown indicator
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      

      {/* --- BODY CONTENT --- */}
      <main className="grow">
        
        {/* Hero Section */}
        <section className="bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Your Campus, <span className="text-blue-600">Digitalized.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              Streamline your student life. Generate gate passes, check events, and report issues instantly.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth/signup" className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all">
                Get Started
              </Link>
              <Link href="/club_events" className="px-8 py-3 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                Browse Events
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* --- CARD 1: GATE PASS (Quick Select) --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Gate Pass</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6">Where are you heading today?</p>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  {/* Option 1: Hostel */}
                  <Link 
                    href="/gate-pass/hostel" 
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 transition-all group"
                  >
                    <Building className="w-5 h-5 text-gray-400 group-hover:text-green-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-green-700">Hostel</span>
                  </Link>

                  {/* Option 2: Market */}
                  <Link 
                    href="/gate-pass/market" 
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 transition-all group"
                  >
                    <Store className="w-5 h-5 text-gray-400 group-hover:text-green-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-green-700">Market</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Club Events */}
              <Link href="/club_events" className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <CalendarDays className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Club</h3>
                <p className="text-gray-500 text-sm">See what's happening on campus this week.</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Schedule <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              {/* Card 3: Report Issues */}
              <Link href="/actions/addissues" className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                  <AlertCircle className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Report Issue</h3>
                <p className="text-gray-500 text-sm">Submit maintenance requests or grievances.</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  File Report <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

              {/* Card 4: Student Dashboard */}
              <Link href="/report/dashboard/student" className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <LayoutDashboard className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">My Dashboard</h3>
                <p className="text-gray-500 text-sm">View your history, status, and profile.</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER (Unchanged) --- */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">CampusConnect</span>
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Empowering students with seamless digital access to campus facilities and services.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link href="/club_events" className="hover:text-blue-400 transition-colors">Events</Link></li>
                <li><Link href="/gate-pass" className="hover:text-blue-400 transition-colors">Gate Pass</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/actions/addissues" className="hover:text-blue-400 transition-colors">Report an Issue</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}