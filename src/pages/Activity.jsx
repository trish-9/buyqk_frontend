import { useMemo, useState } from "react"
import {
  Activity as ActivityIcon,
  Search,
  CheckCheck,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  User,
  Store,
  CreditCard,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

import { useFinance } from "../context/FinanceContext"

export default function ActivityPage() {
  const navigate = useNavigate()

  const {
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useFinance()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  /*
  ==========================================
  FILTER ACTIVITY
  ==========================================
  */

  const filteredActivities =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase()

      return notifications.filter(
        (notification) => {
          const matchesSearch =
            !searchText ||
            [
              notification.title,
              notification.message,
              notification.type,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(searchText)
              )

          let matchesFilter = true

          if (filter === "unread") {
            matchesFilter =
              !notification.read
          }

          if (filter === "inventory") {
            matchesFilter =
              notification.type ===
                "stock" ||
              notification.type ===
                "low-stock" ||
              notification.type ===
                "product" ||
              notification.type ===
                "product-update" ||
              notification.type ===
                "product-delete"
          }

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )
    }, [
      notifications,
      search,
      filter,
    ])

  /*
  ==========================================
  UNREAD COUNT
  ==========================================
  */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length

  /*
  ==========================================
  TIME
  ==========================================
  */

  const formatTime = (date) => {
    if (!date) {
      return ""
    }

    const value =
      new Date(date)

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return ""
    }

    return value.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )
  }

  /*
  ==========================================
  ICON
  ==========================================
  */

  const getIcon = (type) => {
    if (
      type === "stock" ||
      type === "product" ||
      type === "product-update"
    ) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
          <Package
            size={19}
            className="text-blue-600"
          />
        </div>
      )
    }

    if (type === "low-stock") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle
            size={19}
            className="text-amber-600"
          />
        </div>
      )
    }

    if (type === "income") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
          <TrendingUp
            size={19}
            className="text-green-600"
          />
        </div>
      )
    }

    if (type === "expense") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <TrendingDown
            size={19}
            className="text-red-600"
          />
        </div>
      )
    }

    if (
      type === "vendor"
    ) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
          <Store
            size={19}
            className="text-purple-600"
          />
        </div>
      )
    }

    if (
      type === "customer"
    ) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
          <User
            size={19}
            className="text-indigo-600"
          />
        </div>
      )
    }

    if (
      type === "payment"
    ) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
          <CreditCard
            size={19}
            className="text-green-600"
          />
        </div>
      )
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
        <FileText
          size={19}
          className="text-orange-500"
        />
      </div>
    )
  }

  /*
  ==========================================
  OPEN ACTIVITY
  ==========================================
  */

  const handleActivityClick = (
    notification
  ) => {
    if (!notification.read) {
      markNotificationAsRead(
        notification.id
      )
    }

    if (notification.path) {
      navigate(
        notification.path
      )
    }
  }

  return (
    <div className="space-y-6">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">

              <ActivityIcon
                size={22}
                className="text-orange-500"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Activity
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track everything happening in
                your business.
              </p>

            </div>

          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              markAllNotificationsAsRead
            }
            disabled={
              unreadCount === 0
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCheck
              size={17}
            />
            Mark all read
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                notifications.length ===
                0
              ) {
                return
              }

              const confirmed =
                window.confirm(
                  "Clear all activity?"
                )

              if (confirmed) {
                clearNotifications()
              }
            }}
            disabled={
              notifications.length ===
              0
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-red-50
              px-4
              py-2.5
              text-sm
              font-semibold
              text-red-600
              hover:bg-red-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2 size={17} />
            Clear
          </button>

        </div>

      </div>

      {/* ==================================
          STATS
      ================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Stat
          title="Total Activity"
          value={notifications.length}
        />

        <Stat
          title="Unread"
          value={unreadCount}
        />

        <Stat
          title="Inventory Activity"
          value={
            notifications.filter(
              (notification) =>
                notification.type ===
                  "stock" ||
                notification.type ===
                  "low-stock" ||
                notification.type ===
                  "product" ||
                notification.type ===
                  "product-update" ||
                notification.type ===
                  "product-delete"
            ).length
          }
        />

      </div>

      {/* ==================================
          ACTIVITY CARD
      ================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* TOOLBAR */}

        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search activity..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-4
                  text-sm
                  outline-none
                  focus:border-orange-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-orange-100
                "
              />

            </div>

            {/* FILTER */}

            <div className="flex flex-wrap gap-2">

              <FilterButton
                active={
                  filter === "all"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  filter === "unread"
                }
                onClick={() =>
                  setFilter("unread")
                }
              >
                Unread
              </FilterButton>

              <FilterButton
                active={
                  filter === "inventory"
                }
                onClick={() =>
                  setFilter(
                    "inventory"
                  )
                }
              >
                Inventory
              </FilterButton>

            </div>

          </div>

        </div>

        {/* ACTIVITY LIST */}

        {filteredActivities.length ===
        0 ? (
          <div className="p-12 text-center">

            <ActivityIcon
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="font-semibold text-slate-700">
              No activity found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              New actions will appear here
              automatically.
            </p>

          </div>
        ) : (
          <div>

            {filteredActivities.map(
              (notification) => (
                <div
                  key={
                    notification.id
                  }
                  className={`
                    flex
                    gap-4
                    border-b
                    border-slate-100
                    p-5
                    transition
                    last:border-0
                    hover:bg-slate-50
                    ${
                      !notification.read
                        ? "bg-orange-50/40"
                        : ""
                    }
                  `}
                >

                  {/* ICON */}

                  {getIcon(
                    notification.type
                  )}

                  {/* CONTENT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleActivityClick(
                        notification
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2">

                        <h3 className="font-semibold text-slate-800">
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.read && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                            NEW
                          </span>
                        )}

                      </div>

                      <span className="text-xs text-slate-400">
                        {formatTime(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {
                        notification.message
                      }
                    </p>

                  </button>

                  {/* READ BUTTON */}

                  {!notification.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={() =>
                        markNotificationAsRead(
                          notification.id
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-400
                        hover:bg-green-50
                        hover:text-green-600
                      "
                    >
                      <CheckCheck
                        size={17}
                      />
                    </button>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  )
}

/*
==========================================
STAT
==========================================
*/

function Stat({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}

/*
==========================================
FILTER BUTTON
==========================================
*/

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        px-3
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "bg-orange-500 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }
      `}
    >
      {children}
    </button>
  )
}