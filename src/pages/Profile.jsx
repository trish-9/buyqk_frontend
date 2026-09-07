import { useState } from 'react'
import {
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  FileText,
  Save,
  Check,
} from 'lucide-react'

export default function Profile() {
  const getUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          'user'
        ) || 'null'
      )
    } catch {
      return null
    }
  }

  const storedUser = getUser()

  const [name, setName] =
    useState(
      localStorage.getItem(
        'userName'
      ) ||
        storedUser?.name ||
        ''
    )

  const [email, setEmail] =
    useState(
      localStorage.getItem(
        'userEmail'
      ) ||
        storedUser?.email ||
        ''
    )

  const [businessName, setBusinessName] =
    useState(
      storedUser?.businessName ||
        localStorage.getItem(
          'businessName'
        ) ||
        ''
    )

  const [phone, setPhone] =
    useState(
      storedUser?.phone ||
        localStorage.getItem(
          'userPhone'
        ) ||
        ''
    )

  const [gstin, setGstin] =
    useState(
      storedUser?.gstin ||
        localStorage.getItem(
          'gstin'
        ) ||
        ''
    )

  const [address, setAddress] =
    useState(
      storedUser?.address ||
        localStorage.getItem(
          'userAddress'
        ) ||
        ''
    )

  const [saved, setSaved] =
    useState(false)

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map(
        (word) => word[0]
      )
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const saveProfile = () => {
    const currentUser =
      getUser() || {}

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      email:
        email.trim().toLowerCase(),
      businessName:
        businessName.trim(),
      phone: phone.trim(),
      gstin:
        gstin.trim().toUpperCase(),
      address:
        address.trim(),
    }

    localStorage.setItem(
      'user',
      JSON.stringify(
        updatedUser
      )
    )

    localStorage.setItem(
      'userName',
      name.trim()
    )

    localStorage.setItem(
      'userEmail',
      email
        .trim()
        .toLowerCase()
    )

    localStorage.setItem(
      'businessName',
      businessName.trim()
    )

    localStorage.setItem(
      'userPhone',
      phone.trim()
    )

    localStorage.setItem(
      'gstin',
      gstin
        .trim()
        .toUpperCase()
    )

    localStorage.setItem(
      'userAddress',
      address.trim()
    )

    window.dispatchEvent(
      new Event(
        'financeDataUpdated'
      )
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ==================================
          HEADER
      ================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal and business
          information.
        </p>

      </div>

      {/* ==================================
          PROFILE HEADER
      ================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
            {initials}
          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              {name ||
                'Your Name'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {email ||
                'your@email.com'}
            </p>

            <span className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              Merchant
            </span>

          </div>

        </div>

      </div>

      {/* ==================================
          PERSONAL INFORMATION
      ================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your name and contact details.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* NAME */}

          <InputField
            icon={
              <User size={18} />
            }
            label="Full Name"
            value={name}
            onChange={
              setName
            }
            placeholder="Enter your full name"
          />

          {/* EMAIL */}

          <InputField
            icon={
              <Mail size={18} />
            }
            label="Email Address"
            type="email"
            value={email}
            onChange={
              setEmail
            }
            placeholder="Enter your email"
          />

          {/* PHONE */}

          <InputField
            icon={
              <Phone size={18} />
            }
            label="Phone Number"
            value={phone}
            onChange={
              setPhone
            }
            placeholder="Enter phone number"
          />

          {/* BUSINESS */}

          <InputField
            icon={
              <Building2
                size={18}
              />
            }
            label="Business Name"
            value={
              businessName
            }
            onChange={
              setBusinessName
            }
            placeholder="Enter business name"
          />

        </div>

      </div>

      {/* ==================================
          BUSINESS INFORMATION
      ================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Business Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information used for your business
            records and GST.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* GSTIN */}

          <InputField
            icon={
              <FileText
                size={18}
              />
            }
            label="GSTIN"
            value={gstin}
            onChange={(value) =>
              setGstin(
                value.toUpperCase()
              )
            }
            placeholder="Enter GSTIN"
          />

          {/* ADDRESS */}

          <InputField
            icon={
              <MapPin
                size={18}
              />
            }
            label="Business Address"
            value={address}
            onChange={
              setAddress
            }
            placeholder="Enter business address"
          />

        </div>

      </div>

      {/* ==================================
          SAVE
      ================================== */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={
            saveProfile
          }
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >

          {saved ? (
            <>
              <Check
                size={18}
              />
              Saved
            </>
          ) : (
            <>
              <Save
                size={18}
              />
              Save Profile
            </>
          )}

        </button>

      </div>

    </div>
  )
}

/*
=========================================
INPUT FIELD
=========================================
*/

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
        />

      </div>

    </div>
  )
}