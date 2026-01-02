"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from "@headlessui/react";

import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
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

export default function Example() {
  const router = useRouter(); // ✅ hook in component
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setDbUser(snap.data());
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <Loader />;

  return (
    <Disclosure as="nav" className="bg-gray-800/50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">
            <Image src="/image.png" alt="Logo" width={32} height={32} />
            <div className="hidden sm:flex gap-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <BellIcon className="h-6 w-6 text-gray-400" />

            <Menu as="div" className="relative">
              <MenuButton className="text-white font-medium">
                {dbUser?.name ?? "User"}
              </MenuButton>

              <MenuItems className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1">
                <MenuItem>
                  <p className="px-4 py-2 text-sm text-gray-300">
                    Roll: {dbUser?.rollNumber ?? "—"}
                  </p>
                </MenuItem>

                <MenuItem>
                  <p className="px-4 py-2 text-sm text-gray-300">
                    Email: {dbUser?.email}
                  </p>
                </MenuItem>

                <MenuItem>
                  <button
                    onClick={() => handleSignOut(router)} // ✅ CORRECT
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden px-4 pb-3">
        {navigation.map((item) => (
          <DisclosureButton
            key={item.name}
            as="a"
            href={item.href}
            className="block text-gray-300 py-2"
          >
            {item.name}
          </DisclosureButton>
        ))}
      </DisclosurePanel>
    </Disclosure>
  );
}
