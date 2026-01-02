"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition
} from "@headlessui/react";
import { 
  Bars3Icon, 
  BellIcon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon, 
  AcademicCapIcon // Using this for the roll number icon in dropdown
} from "@heroicons/react/24/outline";

// Import the specific logo icon used in your previous navbar
import { GraduationCap } from "lucide-react"; 

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import Loader from "./ui/Loader";
import handleSignOut from "@/lib/handleSignOut";

const navigation = [
  { name: "Add Issues", href: "/actions/addissues" },
  { name: "Your Issues", href: "/actions/yourissues" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch User Data ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          setDbUser(snap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return<Loader size={80} speed={1.8} color="#10b981" />;

  return (
    <Disclosure as="nav" className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              
              {/* --- LEFT SECTION: Logo & Desktop Nav --- */}
              <div className="flex items-center gap-8">
                
                {/* LOGO: Adapted from your previous navbar */}
                <div 
                  className="flex items-center gap-2 cursor-pointer group" 
                  onClick={() => router.push('/')}
                >
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">
                    CampusConnect
                  </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* --- RIGHT SECTION: Icons & Profile --- */}
              <div className="hidden sm:flex items-center gap-5">
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 group">
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900 animate-pulse"></span>
                </button>

                {/* Profile Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                    <span className="text-sm font-medium text-gray-200 hidden md:block pl-2">
                      {dbUser?.name?.split(' ')[0] || "Student"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 z-10 mt-3 w-64 origin-top-right rounded-xl bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 border border-white/10 focus:outline-none divide-y divide-white/5">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-slate-800/50">
                        <p className="text-sm font-medium text-white truncate">
                          {dbUser?.name || "Guest User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {dbUser?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <MenuItem>
                          {({ active }) => (
                            <div className={classNames(active ? 'bg-white/5' : '', 'flex items-center px-4 py-3 text-sm text-gray-300')}>
                              <AcademicCapIcon className="w-4 h-4 mr-3 text-blue-400" />
                              <div className="flex flex-col">
                                <span className="font-medium">Roll Number</span>
                                <span className="text-xs text-gray-500">{dbUser?.rollNumber || "Not Set"}</span>
                              </div>
                            </div>
                          )}
                        </MenuItem>
                      </div>

                      <div className="py-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleSignOut(router)}
                              className={classNames(
                                active ? 'bg-red-500/10 text-red-400' : 'text-gray-300',
                                'flex w-full items-center px-4 py-3 text-sm font-medium transition-colors'
                              )}
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                              Sign out
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>

              {/* --- MOBILE TOGGLE --- */}
              <div className="-mr-2 flex sm:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* --- MOBILE PANEL --- */}
          <DisclosurePanel className="sm:hidden bg-slate-900 border-t border-white/10">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-300 hover:bg-blue-600/20 hover:text-white transition-colors"
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            
            {/* Mobile User Section */}
            <div className="border-t border-white/10 pb-4 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{dbUser?.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-400 mt-1">{dbUser?.email}</div>
                </div>
                <button className="ml-auto flex-shrink-0 rounded-full bg-white/5 p-1 text-gray-400 hover:text-white">
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <DisclosureButton
                  as="div"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Roll No: {dbUser?.rollNumber}
                </DisclosureButton>
                <DisclosureButton
                  as="button"
                  onClick={() => handleSignOut(router)}
                  className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sign out
                </DisclosureButton>
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}