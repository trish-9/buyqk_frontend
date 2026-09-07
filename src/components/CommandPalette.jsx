import { useEffect, useState } from "react"
import {
  Search,
  FilePlus,
  UserPlus,
  PackagePlus,
  WalletCards,
  Receipt,
  BarChart3,
  Settings,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const commands = [
  {
    name: "Create Invoice",
    shortcut: "I",
    icon: FilePlus,
    path: "/invoices",
  },
  {
    name: "Add Customer",
    shortcut: "C",
    icon: UserPlus,
    path: "/customers",
  },
  {
    name: "Add Product",
    shortcut: "P",
    icon: PackagePlus,
    path: "/products",
  },
  {
    name: "Record Payment",
    shortcut: "R",
    icon: WalletCards,
    path: "/payments",
  },
  {
    name: "Add Expense",
    shortcut: "E",
    icon: Receipt,
    path: "/expenses",
  },
  {
    name: "Open Reports",
    shortcut: "O",
    icon: BarChart3,
    path: "/reports",
  },
  {
    name: "Open Settings",
    shortcut: "S",
    icon: Settings,
    path: "/settings",
  },
]

export default function CommandPalette() {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault()
        setOpen(true)
      }

      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    const handleCommandShortcut = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return
      }

      const command = commands.find(
        (item) =>
          item.shortcut.toLowerCase() ===
          event.key.toLowerCase()
      )

      if (command) {
        event.preventDefault()
        navigate(command.path)
        setOpen(false)
      }
    }

    window.addEventListener(
      "keydown",
      handleCommandShortcut
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleCommandShortcut
      )
    }
  }, [open, navigate])

  if (!open) {
    return null
  }

  const filteredCommands = commands.filter(
    (command) =>
      command.name
        .toLowerCase()
        .includes(query.toLowerCase())
  )

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-start
        justify-center
        bg-slate-950/40
        p-4
        pt-[12vh]
        backdrop-blur-sm
      "
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search
            size={20}
            className="text-slate-400"
          />

          <input
            autoFocus
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="What do you want to do?"
            className="
              h-14
              flex-1
              border-0
              px-3
              text-sm
              outline-none
            "
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No command found.
            </div>
          ) : (
            filteredCommands.map((command) => {
              const Icon = command.icon

              return (
                <button
                  key={command.name}
                  type="button"
                  onClick={() => {
                    navigate(command.path)
                    setOpen(false)
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    hover:bg-orange-50
                  "
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon size={18} />
                  </div>

                  <span className="flex-1 text-sm font-medium text-slate-700">
                    {command.name}
                  </span>

                  <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400">
                    {command.shortcut}
                  </kbd>
                </button>
              )
            })
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
          Press{" "}
          <kbd className="rounded border px-1.5 py-0.5">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border px-1.5 py-0.5">
            K
          </kbd>{" "}
          anytime to open this menu.
        </div>
      </div>
    </div>
  )
}