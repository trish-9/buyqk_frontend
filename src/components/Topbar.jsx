import { useEffect, useMemo, useState } from 'react'

import {
  Menu,
  MapPin,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  Settings,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCheck,
  Trash2,
  Mail,
  MessageCircle,
  ExternalLink,
  Map,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import GlobalSearch from './GlobalSearch'

import { useFinance } from '../context/FinanceContext'

export default function Topbar({
  onMenuClick = () => {},
}) {
  const navigate = useNavigate()

  const {
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useFinance()

  const [showNotifications, setShowNotifications] =
    useState(false)

  const [showProfile, setShowProfile] =
    useState(false)

  const [showHelp, setShowHelp] =
    useState(false)

  const [showLocation, setShowLocation] =
    useState(false)

  // =========================================
  // SUPPORT INFORMATION
  // =========================================

  const SUPPORT_EMAIL =
    'kaushalyadav0845@gmail.com'

  const SUPPORT_PHONE =
    '+9779814760845'

  const WHATSAPP_NUMBER =
    '9779814760845'

  // =========================================
  // USER INFORMATION
  // =========================================

  const getStoredUser = () => {
    try {
      const savedUser =
        localStorage.getItem('user')

      if (savedUser) {
        return JSON.parse(savedUser)
      }
    } catch {
      return null
    }

    return null
  }

  const getUserName = () => {
    const user =
      getStoredUser()

    return (
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      user?.name ||
      'Kaushal Yadav'
    )
  }

  const getUserEmail = () => {
    const user =
      getStoredUser()

    return (
      localStorage.getItem('userEmail') ||
      localStorage.getItem('email') ||
      user?.email ||
      'kaushalyadav0845@gmail.com'
    )
  }

  const [userName, setUserName] =
    useState(getUserName)

  const [userEmail, setUserEmail] =
    useState(getUserEmail)

  // =========================================
  // UPDATE USER INFORMATION
  // =========================================

  useEffect(() => {
    const updateProfileInfo = () => {
      setUserName(
        getUserName()
      )

      setUserEmail(
        getUserEmail()
      )
    }

    window.addEventListener(
      'financeDataUpdated',
      updateProfileInfo
    )

    window.addEventListener(
      'profileUpdated',
      updateProfileInfo
    )

    window.addEventListener(
      'storage',
      updateProfileInfo
    )

    return () => {
      window.removeEventListener(
        'financeDataUpdated',
        updateProfileInfo
      )

      window.removeEventListener(
        'profileUpdated',
        updateProfileInfo
      )

      window.removeEventListener(
        'storage',
        updateProfileInfo
      )
    }
  }, [])

  // =========================================
  // INITIALS
  // =========================================

  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .map(
        (word) =>
          word[0]
      )
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    useMemo(() => {
      return notifications.filter(
        (notification) =>
          !notification.read
      ).length
    }, [notifications])

  // =========================================
  // TIME AGO
  // =========================================

  const getTimeAgo = (
    date
  ) => {
    if (!date) {
      return ''
    }

    const time =
      new Date(
        date
      ).getTime()

    if (
      Number.isNaN(time)
    ) {
      return ''
    }

    const seconds =
      Math.floor(
        (Date.now() -
          time) /
          1000
      )

    if (
      seconds < 60
    ) {
      return 'Just now'
    }

    const minutes =
      Math.floor(
        seconds / 60
      )

    if (
      minutes < 60
    ) {
      return `${minutes} min ago`
    }

    const hours =
      Math.floor(
        minutes / 60
      )

    if (
      hours < 24
    ) {
      return `${hours} hour${
        hours > 1
          ? 's'
          : ''
      } ago`
    }

    const days =
      Math.floor(
        hours / 24
      )

    return `${days} day${
      days > 1
        ? 's'
        : ''
    } ago`
  }

  // =========================================
  // NOTIFICATION ICON
  // =========================================

  const NotificationIcon = ({
    type,
  }) => {
    if (
      type ===
      'income'
    ) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
          <TrendingUp
            size={18}
            className="text-green-600"
          />
        </div>
      )
    }

    if (
      type ===
      'expense'
    ) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
          <TrendingDown
            size={18}
            className="text-red-500"
          />
        </div>
      )
    }

    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
        <FileText
          size={18}
          className="text-orange-500"
        />
      </div>
    )
  }

  // =========================================
  // NOTIFICATION CLICK
  // =========================================

  const handleNotificationClick =
    (notification) => {
      if (
        !notification.read
      ) {
        markNotificationAsRead(
          notification.id
        )
      }

      setShowNotifications(
        false
      )

      if (
        notification.path
      ) {
        navigate(
          notification.path
        )
      }
    }

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem(
      'isLoggedIn'
    )

    localStorage.removeItem(
      'userName'
    )

    localStorage.removeItem(
      'name'
    )

    localStorage.removeItem(
      'userEmail'
    )

    localStorage.removeItem(
      'email'
    )

    setShowProfile(
      false
    )

    setShowNotifications(
      false
    )

    setShowHelp(false)

    setShowLocation(
      false
    )

    navigate(
      '/login',
      {
        replace: true,
      }
    )
  }

  // =========================================
  // EMAIL SUPPORT
  // =========================================

  const handleEmailSupport =
    () => {
      const subject =
        'Accounting Dashboard Support'

      const body =
        `Hello,

I need help with my Accounting Dashboard.

Please assist me.

Thank you.`

      const emailUrl =
        `mailto:${SUPPORT_EMAIL}` +
        `?subject=${encodeURIComponent(
          subject
        )}` +
        `&body=${encodeURIComponent(
          body
        )}`

      window.location.href =
        emailUrl

      setShowHelp(false)
    }

  // =========================================
  // WHATSAPP SUPPORT
  // =========================================

  const handleWhatsAppSupport =
    () => {
      const message =
        `Hello,

I need help with my Accounting Dashboard.

Please assist me.

Thank you.`

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(
          message
        )}`

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      )

      setShowHelp(false)
    }

  // =========================================
  // LOCATION
  // =========================================

  const handleLocation =
    () => {
      const location =
        'Dwarka, Delhi'

      const mapUrl =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )}`

      window.open(
        mapUrl,
        '_blank',
        'noopener,noreferrer'
      )

      setShowLocation(false)
    }

  // =========================================
  // CLOSE MENUS
  // =========================================

  const closeOtherMenus = () => {
    setShowNotifications(
      false
    )

    setShowProfile(false)

    setShowHelp(false)

    setShowLocation(false)
  }

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">

      {/* =====================================
          MOBILE MENU
      ===================================== */}

      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100 lg:hidden"
        title="Open menu"
      >
        <Menu size={21} />
      </button>

      {/* =====================================
          SEARCH
      ===================================== */}

      <div className="max-w-[560px] flex-1">
        <GlobalSearch />
      </div>

      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="ml-auto flex items-center gap-2">

        {/* =====================================
            LOCATION
        ===================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setShowLocation(
                (value) =>
                  !value
              )

              setShowNotifications(
                false
              )

              setShowProfile(
                false
              )

              setShowHelp(
                false
              )
            }}
            className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 transition hover:bg-slate-50 xl:flex"
            title="Location"
          >
            <MapPin
              size={17}
              className="text-slate-700"
            />

            <span className="text-sm font-medium text-slate-700">
              Dwarka, Delhi
            </span>

            <ChevronDown
              size={15}
              className={`text-slate-400 transition ${
                showLocation
                  ? 'rotate-180'
                  : ''
              }`}
            />
          </button>

          {showLocation && (
            <div className="absolute right-0 top-14 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">

              <div className="mb-2 px-2 py-2">

                <p className="text-xs font-medium text-slate-400">
                  Current Location
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  Dwarka, Delhi
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleLocation
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Map
                  size={18}
                />

                <span>
                  Open in Google Maps
                </span>

                <ExternalLink
                  size={15}
                  className="ml-auto text-slate-400"
                />
              </button>

            </div>
          )}

        </div>

        {/* =====================================
            NOTIFICATIONS
        ===================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setShowNotifications(
                (value) =>
                  !value
              )

              setShowProfile(
                false
              )

              setShowHelp(
                false
              )

              setShowLocation(
                false
              )
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50"
            title="Notifications"
          >

            <Bell
              size={20}
              className="text-slate-700"
            />

            {unreadCount >
              0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount >
                99
                  ? '99+'
                  : unreadCount}
              </span>
            )}

          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                <div>

                  <h3 className="font-semibold text-slate-800">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {unreadCount >
                    0
                      ? `${unreadCount} unread`
                      : 'All caught up'}
                  </p>

                </div>

                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      markAllNotificationsAsRead
                    }
                    className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
                  >
                    <CheckCheck
                      size={14}
                    />
                    Mark all read
                  </button>
                )}

              </div>

              {/* LIST */}

              <div className="max-h-[420px] overflow-y-auto">

                {notifications.length ===
                0 ? (
                  <div className="px-6 py-12 text-center">

                    <Bell
                      size={34}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      New activity will appear here.
                    </p>

                  </div>
                ) : (
                  notifications.map(
                    (
                      notification
                    ) => (
                      <button
                        type="button"
                        key={
                          notification.id
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                          notification.read
                            ? 'bg-white'
                            : 'bg-orange-50/40'
                        }`}
                      >

                        <NotificationIcon
                          type={
                            notification.type
                          }
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <p
                              className={`text-sm ${
                                notification.read
                                  ? 'font-medium text-slate-600'
                                  : 'font-semibold text-slate-800'
                              }`}
                            >
                              {
                                notification.title
                              }
                            </p>

                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                            )}

                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {getTimeAgo(
                              notification.createdAt
                            )}
                          </p>

                        </div>

                      </button>
                    )
                  )
                )}

              </div>

              {/* FOOTER */}

              {notifications.length >
                0 && (
                <div className="flex items-center justify-between border-t border-slate-100 p-3">

                  <button
                    type="button"
                    onClick={() =>
                      clearNotifications()
                    }
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
                  >
                    <Trash2
                      size={14}
                    />

                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                    className="text-xs font-medium text-orange-500 hover:text-orange-600"
                  >
                    Close
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =====================================
            HELP
        ===================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setShowHelp(
                (value) =>
                  !value
              )

              setShowNotifications(
                false
              )

              setShowProfile(
                false
              )

              setShowLocation(
                false
              )
            }}
            className="hidden h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50 md:flex"
            title="Help & Support"
          >
            <HelpCircle
              size={20}
              className="text-slate-700"
            />
          </button>

          {showHelp && (
            <div className="absolute right-0 top-14 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <HelpCircle
                      size={21}
                      className="text-orange-500"
                    />
                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Help & Support
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      We are here to help you
                    </p>

                  </div>

                </div>

              </div>

              {/* EMAIL */}

              <button
                type="button"
                onClick={
                  handleEmailSupport
                }
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Mail
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-slate-800">
                    Email Support
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {SUPPORT_EMAIL}
                  </p>

                </div>

                <ExternalLink
                  size={15}
                  className="text-slate-400"
                />

              </button>

              {/* WHATSAPP */}

              <button
                type="button"
                onClick={
                  handleWhatsAppSupport
                }
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-green-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <MessageCircle
                    size={19}
                    className="text-green-600"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-slate-800">
                    WhatsApp Support
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {SUPPORT_PHONE}
                  </p>

                </div>

                <ExternalLink
                  size={15}
                  className="text-slate-400"
                />

              </button>

              <div className="border-t border-slate-100 px-4 py-3">

                <p className="text-center text-[11px] text-slate-400">
                  Email or WhatsApp us anytime for
                  assistance.
                </p>

              </div>

            </div>
          )}

        </div>

        {/* =====================================
            PROFILE
        ===================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={() => {
              setShowProfile(
                (value) =>
                  !value
              )

              setShowNotifications(
                false
              )

              setShowHelp(
                false
              )

              setShowLocation(
                false
              )
            }}
            className="flex items-center gap-2 md:gap-3"
            title="Profile"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
              {initials}
            </div>

            <div className="hidden text-left md:block">

              <p className="text-sm font-semibold text-slate-800">
                {userName}
              </p>

              <p className="text-[11px] text-slate-400">
                Merchant
              </p>

            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition md:block ${
                showProfile
                  ? 'rotate-180'
                  : ''
              }`}
            />

          </button>

          {/* PROFILE DROPDOWN */}

          {showProfile && (
            <div className="absolute right-0 top-14 w-[350px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">

              {/* USER */}

              <div className="mb-1 border-b border-slate-100 px-3 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-base font-semibold text-slate-800">
                      {userName}
                    </p>

                    <p className="truncate text-sm text-slate-400">
                      {userEmail}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Merchant
                    </p>

                  </div>

                </div>

              </div>

              {/* MY PROFILE */}

              <button
                type="button"
                onClick={() => {
                  setShowProfile(
                    false
                  )

                  navigate(
                    '/profile'
                  )
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >

                <User
                  size={18}
                />

                <span>
                  My Profile
                </span>

              </button>

              {/* SETTINGS */}

              <button
                type="button"
                onClick={() => {
                  setShowProfile(
                    false
                  )

                  navigate(
                    '/settings'
                  )
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >

                <Settings
                  size={18}
                />

                <span>
                  Settings
                </span>

              </button>

              {/* DIVIDER */}

              <div className="my-1 border-t border-slate-100" />

              {/* LOGOUT */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-600 transition hover:bg-red-50"
              >

                <LogOut
                  size={18}
                />

                <span>
                  Logout
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  )
}